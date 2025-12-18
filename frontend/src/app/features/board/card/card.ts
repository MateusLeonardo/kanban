import { Component, input } from '@angular/core';
import { CardModel } from '../../../services/kanban.service';
import { CdkDragHandle, CdkDrag } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-card',
  imports: [CdkDrag],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  card = input.required<CardModel>();
}
