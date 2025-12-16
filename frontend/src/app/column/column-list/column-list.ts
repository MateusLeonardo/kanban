import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Card, Column, Kanban, ReorderCardDto } from '../../services/kanban.service';

@Component({
  selector: 'cdk-drag-drop-connected-sorting-group-example',
  templateUrl: './column-list.html',
  styleUrl: './column-list.css',
  imports: [CdkDropListGroup, CdkDropList, CdkDrag, CdkDragHandle],
})
export class ColumnList implements OnInit {
  protected readonly columns = signal<Column[]>([]);
  private kanban = inject(Kanban);

  ngOnInit() {
    this.kanban.getColumnsWithCards().subscribe((columns) => {
      this.columns.set(columns);
    });
  }

  // Retorna IDs de todas as colunas para conectar os drop lists
  getConnectedLists(): string[] {
    return this.columns().map((col) => `column-${col.id}`);
  }

  dropColumn(event: CdkDragDrop<Column[]>) {
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

  dropCard(event: CdkDragDrop<Card[]>, targetColumnId: number) {
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
}
