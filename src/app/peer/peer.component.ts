import { Component, Input, OnInit } from '@angular/core';
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
    this.service.call$.subscribe((m) => {
      switch (m.type) {
        case 'offer':
        case 'answer':
          this.peer.signal(m.data);
          break;
        default:
          console.log('->', m);
      }
    });
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
        this.initPeer();
      });
  }

  initPeer() {
    this.initiator = this.service.host;
    this.peer = new SimplePeer({
      initiator: this.initiator,
      trickle: false,
      stream: this.localStream,
    }) as ISimplePeer;

    this.peer.on('signal', (data) => {
      console.log(data);
      if (data.type === 'offer') {
        this.offer = data;
      }
      if (data.type === 'answer') {
        this.sendAnswer(data);
      }
    });

    this.peer.on('data', (data: any) => {
      console.log('Message!!!!', data);
    });
    this.peer.on('stream', (stream: MediaStream) => {
      console.log('Stream!!!!');
      this.peerStreams.push(stream);
    });

    // console.log(JSON.stringify(this.peer));
  }

  sendOffer() {
    this.service.sendMessage({
      id: this.id,
      data: this.offer,
      room: this.room,
      type: 'offer',
      message: 'Hallllllloooooooooo',
    });
  }
  sendAnswer(data: any) {
    this.service.sendMessage({
      id: this.id,
      data: data,
      room: this.room,
      type: 'answer',
      message: '',
    });
  }
}
