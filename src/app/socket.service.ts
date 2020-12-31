import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, ReplaySubject } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';
import { IMsg } from '../../models/IMessage';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket = new WebSocketSubject<IMsg>('ws://localhost:3002');
  id$ = new BehaviorSubject<string>('');
  message$ = new Subject<IMsg>();
  room$ = new ReplaySubject<IMsg>();
  call$ = new Subject<IMsg>();
  member$ = new ReplaySubject<IMsg>();
  host = false;
  constructor() {
    this.socket.subscribe((m) => this.handleEvents(m));
  }

  sendMessage(m: IMsg) {
    this.socket.next(m);
  }

  handleEvents(m: IMsg) {
    switch (m.type) {
      case 'user-connected':
      case 'user-disconnected':
        this.member$.next(m);
        break;
      case 'connection':
        this.id$.next(m.id);
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
        this.call$.next(m);
        break;
      case 'room-joined':
      case 'welcome':
        this.room$.next(m);
        break;
      default:
        console.log('DEBUG', m);
        break;
    }
  }
}
