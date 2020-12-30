import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';
import { IMsg } from '../../models/IMessage';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket = new WebSocketSubject<IMsg>('ws://localhost:3002');
  id$ = new BehaviorSubject<string>('');
  message$ = new Subject<IMsg>();
  connection$ = new Subject<IMsg>();
  call$ = new Subject<IMsg>();
  host = false;
  constructor() {
    this.socket.subscribe((m) => this.handleEvents(m));
  }

  sendMessage(m: IMsg) {
    this.socket.next(m);
  }

  handleEvents(m: IMsg) {
    switch (m.type) {
      case 'connection':
        if (m.message === 'Welcome') {
          this.id$.next(m.id);
        }
        this.connection$.next(m);
        break;
      case 'message':
        this.message$.next(m);
        break;
      case 'room-created':
        this.host = true;
        break;
      case 'call':
      case 'offer':
      case 'answer':
      case 'room-joined':
        this.call$.next(m);
        break;
      default:
        console.log('DEBUG', m);
        break;
    }
  }
}
