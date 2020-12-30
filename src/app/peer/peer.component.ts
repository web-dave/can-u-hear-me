import { Component, Input, OnInit } from '@angular/core';
import { IMsg, IMsgType } from 'models/IMessage';
import { ISimplePeer } from 'models/simple-peer';
import { from, Subject } from 'rxjs';
import { delay, filter, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { SocketService } from '../socket.service';
let SimplePeer: any;

@Component({
  selector: 'app-peer',
  templateUrl: './peer.component.html',
  styleUrls: ['./peer.component.scss'],
})
export class PeerComponent implements OnInit {
  @Input() room: string = '';
  initiator = false;
  peer!: ISimplePeer;
  peers: ISimplePeer[] = [];
  end$ = new Subject();
  id: string = '';
  offer: any;
  localStream!: MediaStream;
  peerStreams: MediaStream[] = [];
  streamStartet = false;
  constructor(private service: SocketService) {}

  ngOnInit(): void {
    this.service.id$
      .pipe(
        filter((data) => data !== ''),
        tap((id) => (this.id = id)),
        mergeMap(() =>
          from(
            navigator.mediaDevices.getUserMedia({ audio: false, video: true })
          )
        ),
        tap((stream) => (this.localStream = stream)),
        mergeMap(() =>
          // @ts-ignore
          from(import('node_modules/simple-peer/simplepeer.min.js'))
        )
      )
      .pipe(takeUntil(this.end$), delay(500))
      .subscribe((data) => {
        SimplePeer = data.default;
        this.initiator = this.service.host;
        this.waitForRoomMates();
      });
  }

  waitForRoomMates() {
    this.service.room$.subscribe((m) => {
      console.log(m.type);
      switch (m.type) {
        case 'room-joined':
        case 'welcome':
          this.initPeer();
          break;
        default:
          console.log(m.type, m);
      }
    });
  }
  waitForRoomCalls() {
    this.service.call$.subscribe((m) => {
      switch (m.type) {
        case 'offer':
        case 'answer':
          this.peer.signal(m.data);
          break;
        default:
          console.log(m.type, m);
      }
    });
  }
  i = 0;
  initPeer() {
    this.i++;
    this.peer = new SimplePeer({
      initiator: this.initiator,
      trickle: false,
      stream: this.localStream,
    }) as ISimplePeer;

    this.peer.on('signal', (data) => {
      if (data.type === 'offer') {
        this.offer = data;
      }
      if (data.type === 'answer') {
        this.sendMessage('answer', data);
      }
    });

    this.peer.on('data', (data: any) => {
      console.log('Message!!!!', data);
    });
    this.peer.on('stream', (stream: MediaStream) => {
      console.log('Stream!!!!');
      this.peerStreams.push(stream);
    });
    if (this.i === 1) {
      this.waitForRoomCalls();
    }
  }

  sendMessage(type: IMsgType, data: any, message = '') {
    this.service.sendMessage({
      id: this.id,
      data,
      room: this.room,
      type,
      message,
    });
  }
  sendOffer() {
    this.sendMessage('offer', this.offer);
  }
}
