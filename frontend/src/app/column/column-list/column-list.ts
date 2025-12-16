import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Column, Kanban } from '../../services/kanban.service';
/**
 * @title Drag&Drop connected sorting group
 */
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
      console.log(columns);
      this.columns.set(columns);
    });
  }

  drop(event: CdkDragDrop<Column[]>) {
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
