import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements OnInit, OnDestroy {
  show = false;
  refVideo: any;
  socketRef$!: WebSocketSubject<unknown>;
  roomId: string = '';
  end$ = new Subject();
  constructor(private http: HttpClient) {}

  ngOnDestroy() {
    this.end$.next(0);
  }

  toggleShow() {
    this.show = !this.show;
    if (!this.show) {
      this.socketRef$.next({ message: '!show' });
    } else {
      this.socketRef$.next({ joinroom: this.roomId });
    }
  }

  ngOnInit(): void {
    this.http
      .get<{ roomId: string }>('http://localhost:3000/')
      .subscribe((data) => (this.roomId = data.roomId));
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        this.refVideo = stream;
      });

    this.socketRef$ = webSocket('ws://localhost:4201');

    this.socketRef$
      .pipe(takeUntil(this.end$))
      .subscribe((ws: any) => console.log(ws));
  }
}
