import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';
import { IMsg } from '../../models/message';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket = new WebSocketSubject<IMsg>('ws://localhost:3002');
  id$ = new BehaviorSubject<string>('');
  message$ = new Subject<IMsg>();
  connection$ = new Subject<IMsg>();
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
    }
  }
}
