import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { IMsg } from '../../../models/message';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() room: string = '';

  msg: string = '';
  messages: IMsg[] = [];
  end$ = new Subject();
  id: string = '';
  constructor(private service: SocketService) {}
  ngOnInit(): void {
    this.service.id$
      .pipe(
        takeUntil(this.end$),
        filter((data) => data !== '')
      )
      .subscribe((data) => this.registered(data));
  }

  registered(id: string) {
    this.id = id;
    this.joinRoom();
    this.service.message$
      .pipe(takeUntil(this.end$))
      .subscribe((m) => this.messages.push(m));
  }

  sendMessage() {
    this.service.sendMessage({
      type: 'message',
      id: this.id,
      message: this.msg,
      room: this.room,
    });
    this.msg = '';
  }

  joinRoom() {
    this.service.sendMessage({
      type: 'join-room',
      id: this.id,
      message: this.room,
    });
  }
  ngOnDestroy() {
    this.end$.next(1);
  }
}
