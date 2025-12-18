import { Component, viewChild, ViewChild } from '@angular/core';
import { Header } from '../../../shared/layout/header/header';
import { Column } from '../column/column';

@Component({
  selector: 'app-board',
  imports: [Header, Column],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board {
  columnComponent = viewChild.required(Column);

  onColumnCreated() {
    this.columnComponent().loadColumnsWithCards();
  }
}
