import { Component, inject, input, output } from '@angular/core';
import { CardModel, KanbanService } from '../../../services/kanban.service';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { UpdateCardDialog } from '../../../shared/card/update-card-dialog/update-card-dialog';

@Component({
  selector: 'app-card',
  imports: [CdkDrag, MatIconModule, MatButtonModule],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  card = input.required<CardModel>();
  onCardUpdated = output();
  readonly dialog = inject(MatDialog);
  kanbanService = inject(KanbanService);

  openUpdateCardDialog() {
    const dialogRef = this.dialog.open(UpdateCardDialog, {
      data: {
        card: this.card(),
      },
      width: '350px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.kanbanService.updateCard(result).subscribe(() => {
        this.onCardUpdated.emit();
      });
    });
  }
}
