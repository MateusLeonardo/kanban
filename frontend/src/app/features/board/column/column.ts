import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import {
  CardModel,
  ColumnModel,
  CreateCardDto,
  KanbanService,
  ReorderCardDto,
} from '../../../services/kanban.service';
import { WebsocketService } from '../../../services/websocket.service';
import { CreateCardDialog } from '../../../shared/card/create-card-dialog/create-card-dialog';
import { ConfirmDeleteColumnDialog } from '../../../shared/column/confirm-delete-column-dialog/confirm-delete-column-dialog';
import { UpdateColumnDialog } from '../../../shared/column/update-column-dialog/update-column-dialog';
import { Card } from '../card/card';

@Component({
  selector: 'board-column',
  templateUrl: './column.html',
  styleUrl: './column.css',
  imports: [CdkDropList, CdkDrag, MatButtonModule, MatIcon, Card],
})
export class Column implements OnInit {
  protected readonly columns = signal<ColumnModel[]>([]);

  protected readonly connectedLists = computed(() =>
    this.columns().map((col) => `column-${col.id}`)
  );

  private kanban = inject(KanbanService);
  private socket = inject(WebsocketService);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  openUpdateColumnDialog(column: ColumnModel) {
    const dialogRef = this.dialog.open(UpdateColumnDialog, {
      width: '450px',
      disableClose: false,
      data: {
        column,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.kanban.updateColumn(result).subscribe();
      }
    });
  }

  ngOnInit() {
    this.initBoard();

    this.socket
      .on<ColumnModel>('column.created')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((createdColumn) => {
        const columnWithCards = {
          ...createdColumn,
          cards: createdColumn.cards || [],
        };
        this.columns.update((cols) => [...cols, columnWithCards]);
      });

    this.socket
      .on<ColumnModel>('column.updated')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updatedColumn) => {
        this.columns.update((cols) =>
          cols.map((col) => (col.id === updatedColumn.id ? { ...col, ...updatedColumn } : col))
        );
      });

    this.socket
      .on<ColumnModel[]>('column.reordered')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((reorderedColumns) => {
        this.columns.update((currentColumns) => {
          const positionMap = new Map(reorderedColumns.map((col) => [col.id, col.position]));

          const updated = currentColumns.map((col) => ({
            ...col,
            position: positionMap.get(col.id) ?? col.position,
          }));

          return updated.sort((a, b) => a.position - b.position);
        });
      });

    this.socket
      .on<ColumnModel>('column.deleted')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((column) => {
        this.columns.update((cols) => cols.filter((col) => col.id !== column.id));
      });

    this.socket
      .on<CardModel>('card.created')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((createdCard) => {
        this.columns.update((currentColumns) =>
          currentColumns.map((col) =>
            col.id === createdCard.columnId
              ? { ...col, cards: [...(col.cards ?? []), createdCard] }
              : col
          )
        );
      });

    this.socket
      .on<CardModel[]>('card.reordered')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((reorderedCards) => {
        this.columns.update((currentColumns) => {
          const cardMap = new Map(reorderedCards.map((card) => [card.id, card]));

          return currentColumns.map((col) => {
            let cards = col.cards.filter((card) => {
              const updated = cardMap.get(card.id);
              return !updated || updated.columnId === col.id;
            });

            cards = cards.map((card) => {
              const updated = cardMap.get(card.id);
              if (!updated) return card;

              return {
                ...card,
                columnId: updated.columnId,
                position: updated.position,
              };
            });

            reorderedCards
              .filter((card) => card.columnId === col.id)
              .forEach((card) => {
                const exists = cards.some((c) => c.id === card.id);
                if (!exists) {
                  cards.push({
                    ...card,
                  });
                }
              });

            cards.sort((a, b) => a.position - b.position);

            return {
              ...col,
              cards,
            };
          });
        });
      });

    this.socket
      .on<CardModel>('card.updated')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updatedCard) => {
        this.columns.update((currentColumns) =>
          currentColumns.map((col) => ({
            ...col,
            cards: col.cards.map((card) => (card.id === updatedCard.id ? updatedCard : card)),
          }))
        );
      });

    this.socket
      .on<{ id: number }>('card.deleted')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ id }) => {
        this.columns.update((currentColumns) =>
          currentColumns.map((col) => ({
            ...col,
            cards: col.cards.filter((card) => card.id !== id),
          }))
        );
      });
  }

  private initBoard() {
    this.kanban.getColumnsWithCards().subscribe((columnsFetch) => {
      const columnsWithCards = columnsFetch.map((col) => ({
        ...col,
        cards: col.cards || [],
      }));
      this.columns.set(columnsWithCards);
    });
  }

  dropColumn(event: CdkDragDrop<ColumnModel[]>) {
    const cols = [...this.columns()];
    moveItemInArray(cols, event.previousIndex, event.currentIndex);

    this.columns.set(cols);

    this.kanban
      .reorderColumn(
        cols.map((col, index) => ({
          id: col.id,
          position: index,
        }))
      )
      .subscribe();
  }

  dropCard(event: CdkDragDrop<CardModel[]>, targetColumnId: number) {
    if (event.previousContainer === event.container) {
      // MOVIMENTO DENTRO DA MESMA COLUNA
      const cards = [...event.container.data];

      moveItemInArray(cards, event.previousIndex, event.currentIndex);

      this.columns.update((cols) =>
        cols.map((col) => (col.id === targetColumnId ? { ...col, cards } : col))
      );

      this.kanban
        .reorderCard(
          cards.map((card, index) => ({
            id: card.id,
            position: index,
          }))
        )
        .subscribe();
    } else {
      // MOVIMENTO ENTRE COLUNAS
      const sourceCards = [...event.previousContainer.data];
      const targetCards = [...event.container.data];

      transferArrayItem(sourceCards, targetCards, event.previousIndex, event.currentIndex);

      const sourceColumnId = +event.previousContainer.id.replace('column-', '');

      this.columns.update((cols) =>
        cols.map((col) => {
          if (col.id === targetColumnId) {
            return { ...col, cards: targetCards };
          }
          if (col.id === sourceColumnId) {
            return { ...col, cards: sourceCards };
          }
          return col;
        })
      );

      const cardsToUpdate: ReorderCardDto[] = [
        ...sourceCards.map((card, index) => ({
          id: card.id,
          position: index,
        })),
        ...targetCards.map((card, index) => ({
          id: card.id,
          position: index,
          columnId: targetColumnId,
        })),
      ];

      this.kanban.reorderCard(cardsToUpdate).subscribe();
    }
  }
  openDeleteColumnDialog(column: ColumnModel) {
    const dialogRef = this.dialog.open(ConfirmDeleteColumnDialog, {
      width: '350px',
      disableClose: false,
      data: {
        columnName: column.name,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.kanban.deleteColumnWithCards(column.id).subscribe();
      }
    });
  }

  openCreateCardDialog(columnId: number) {
    const dialogRef = this.dialog.open(CreateCardDialog, {
      width: '450px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result: { name: string; description?: string }) => {
      if (!result) return;

      const card: CreateCardDto = {
        name: result.name,
        description: result.description ?? '',
        columnId,
      };

      this.kanban.createCard(card).subscribe();
    });
  }
}
