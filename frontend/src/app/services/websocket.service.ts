import { Injectable } from '@angular/core';
import { from, fromEvent, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { ColumnModel } from './kanban.service';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });
  }

  on<T>(event: string): Observable<T> {
    return fromEvent<T>(this.socket, event);
  }

  emit(event: string, data: any) {
    this.socket.emit(event, data);
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
  }

  connect() {
    if (this.socket) this.socket.connect();
  }
}
