import { Component, OnInit } from '@angular/core';

import { io } from 'socket.io-client';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss'],
})
export class RoomComponent implements OnInit {
  refVideo: any;
  socketRef: any;
  peersRef: any[] = [];
  roomId: string = '';
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.roomId = this.route.snapshot.params.id;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        this.refVideo = stream;
        // this.socketRef = io('http://localhost:3001');
        // console.log(this.socketRef);
      });
  }
}
