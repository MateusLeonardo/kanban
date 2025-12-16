import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Column, Kanban } from './services/kanban.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  protected readonly columns = signal<Column[]>([]);
  private kanban = inject(Kanban);

  ngOnInit() {
    this.kanban.getColumnsWithCards().subscribe((columns) => {
      console.log(columns);
      this.columns.set(columns);
    });
  }
}
