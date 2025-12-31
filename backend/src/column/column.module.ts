import { Module } from '@nestjs/common';
import { ColumnService } from './column.service';
import { ColumnController } from './column.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { KanbanModule } from 'src/gateways/events/events.module';

@Module({
  imports: [PrismaModule, KanbanModule],
  controllers: [ColumnController],
  providers: [ColumnService],
  exports: [ColumnService],
})
export class ColumnModule {}
