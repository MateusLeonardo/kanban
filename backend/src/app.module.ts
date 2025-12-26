import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ColumnModule } from './column/column.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionFilter } from './filters/all-exception.filter';
import { CardModule } from './card/card.module';
import { EventsGateway } from './events/events.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ColumnModule,
    CardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    EventsGateway,
  ],
})
export class AppModule {}
