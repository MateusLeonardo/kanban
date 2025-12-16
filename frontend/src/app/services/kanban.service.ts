import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';

export interface Column {
  id: number;
  name: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  cards: Card[];
}

export interface Card {
  id: number;
  name: string;
  description?: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class Kanban {
  private http = inject(HttpClient);

  getColumnsWithCards() {
    return this.http.get<Column[]>(`${environment.apiUrl}/column`);
  }
}
