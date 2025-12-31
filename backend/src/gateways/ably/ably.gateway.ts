import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import * as Ably from 'ably';

@Injectable()
export class AblyGateway implements OnModuleInit, OnModuleDestroy {
  private client: Ably.Realtime;
  private channel: Ably.RealtimeChannel;
  private readonly CHANNEL_NAME = 'kanban-board';

  async onModuleInit() {
    this.client = new Ably.Realtime({
      key: process.env.ABLY_API_KEY,
    });

    this.channel = this.client.channels.get(this.CHANNEL_NAME);

    await new Promise<void>((resolve, reject) => {
      this.client.connection.on('connected', () => {
        console.log('Ably Gateway inicializado');
        resolve();
      });
      this.client.connection.on('failed', reject);
    });
  }

  onModuleDestroy() {
    this.client.close();
  }

  async emit(event: string, data: any) {
    try {
      await this.channel.publish(event, data);
      console.log('Eveto emitido', event, data);
    } catch (error) {
      throw error;
    }
  }
}
