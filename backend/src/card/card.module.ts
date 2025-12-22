import { Module } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { ColumnModule } from 'src/column/column.module';
import { ColumnService } from 'src/column/column.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ColumnModule, PrismaModule],
  controllers: [CardController],
  providers: [CardService, ColumnService],
})
export class CardModule {}
