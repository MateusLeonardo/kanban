import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Card, Column, Kanban } from '../../services/kanban.service';

@Component({
  selector: 'cdk-drag-drop-connected-sorting-group-example',
  templateUrl: './column-list.html',
  styleUrl: './column-list.css',
  imports: [CdkDropListGroup, CdkDropList, CdkDrag],
})
export class ColumnList implements OnInit {
  protected readonly columns = signal<Column[]>([]);
  private kanban = inject(Kanban);

  ngOnInit() {
    this.kanban.getColumnsWithCards().subscribe((columns) => {
      this.columns.set(columns);
    });
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

  dropCard(event: CdkDragDrop<Card[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
}
