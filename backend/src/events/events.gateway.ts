import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',
  },
})
export class EventsGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  afterInit(server: any) {
    console.log('Gateway inicializado');
  }

  emit(event: string, data: any) {
    this.server.emit(event, data);
  }
}
