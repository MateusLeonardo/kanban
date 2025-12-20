import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  CardModel,
  ReorderCardDto,
  ColumnModel,
  KanbanService,
  CreateCardDto,
} from '../../../services/kanban.service';
import { MatDialog } from '@angular/material/dialog';
import { UpdateColumnDialog } from '../../../shared/column/update-column-dialog/update-column-dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ConfirmDeleteColumnDialog } from '../../../shared/column/confirm-delete-column-dialog/confirm-delete-column-dialog';
import { Card } from '../card/card';
import { CreateCardDialog } from '../../../shared/card/create-card-dialog/create-card-dialog';

@Component({
  selector: 'board-column',
  templateUrl: './column.html',
  styleUrl: './column.css',
  imports: [CdkDropList, CdkDrag, CdkDragHandle, MatButtonModule, MatIcon, Card],
})
export class Column implements OnInit {
  protected readonly columns = signal<ColumnModel[]>([]);
  private kanban = inject(KanbanService);
  private dialog = inject(MatDialog);

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
        this.kanban.updateColumn(result).subscribe(() => {
          this.loadColumnsWithCards();
        });
      }
    });
  }

  ngOnInit() {
    this.loadColumnsWithCards();
  }

  loadColumnsWithCards() {
    this.kanban.getColumnsWithCards().subscribe((columns) => {
      this.columns.set(columns);
    });
  }

  getConnectedLists(): string[] {
    return this.columns().map((col) => `column-${col.id}`);
  }

  dropColumn(event: CdkDragDrop<ColumnModel[]>) {
    const cols = this.columns();
    moveItemInArray(cols, event.previousIndex, event.currentIndex);
    this.columns.set([...cols]);

    this.kanban
      .reorderColumn(
        cols.map((col, index) => ({
          id: col.id,
          position: index,
        }))
      )
      .subscribe({
        error: (err) => {
          console.error('Error reordering columns:', err);
          this.ngOnInit();
        },
      });
  }

  dropCard(event: CdkDragDrop<CardModel[]>, targetColumnId: number) {
    if (event.previousContainer === event.container) {
      // Mover dentro da mesma coluna
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.kanban
        .reorderCard(
          event.container.data.map((card, index) => ({
            id: card.id,
            position: index + 1,
          }))
        )
        .subscribe({
          error: (err) => {
            console.error('Erro ao reordenar cards:', err);
            this.ngOnInit();
          },
        });
    } else {
      // Mover entre colunas diferentes
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const movedCard = event.container.data[event.currentIndex];
      movedCard.columnId = targetColumnId;

      const cardsToUpdate: ReorderCardDto[] = [
        ...event.previousContainer.data.map((card, index) => ({
          id: card.id,
          position: index + 1,
        })),
        ...event.container.data.map((card, index) => ({
          id: card.id,
          position: index + 1,
          columnId: targetColumnId,
        })),
      ];

      this.kanban.reorderCard(cardsToUpdate).subscribe({
        error: (err) => {
          console.error('Erro ao mover card:', err);
          this.ngOnInit();
        },
      });
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
        this.kanban.deleteColumnWithCards(column.id).subscribe(() => {
          this.loadColumnsWithCards();
        });
      }
    });
  }

  openCreateCardDialog(columnId: number) {
    const dialogRef = this.dialog.open(CreateCardDialog, {
      width: '450px',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result: { name: string; description?: string }) => {
      const card: CreateCardDto = {
        name: result.name,
        description: result.description ?? '',
        columnId,
      };
      if (result) {
        this.kanban.createCard(card).subscribe(() => {
          this.loadColumnsWithCards();
        });
      }
    });
  }
}
