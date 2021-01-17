import { Component, OnInit } from '@angular/core';
import { IMsg, IMsgType } from 'models/IMessage.js';
import { Observable } from 'rxjs';
import { SocketService } from './socket.service.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  msg$!: Observable<IMsg>;
  meeting$!: Observable<IMsg>;
  _room = '';
  room = '';
  _name: string = '';
  name: string = '';

  constructor(private service: SocketService) {}
  ngOnInit(): void {
    this.msg$ = this.service.chatSocket$;
    this.meeting$ = this.service.meetingSocket$;
  }

  setName(value: string) {
    if (value) {
      this.name = value;
      this.service.name = this.name;
      if (location.pathname !== '/') {
        this.setRoom(location.pathname.substring(1));
      }
      this.sendMessage(this.name, 'connection');
    }
  }

  sendMessage(message: string, type: IMsgType = 'message') {
    this.service.sendMessage(message, this.room, type);
  }
  setRoom(value: string) {
    if (value) {
      this.room = value;
      this.service.room = this.room;
      this.sendMessage(this.room, 'join');
    }
  }
}
