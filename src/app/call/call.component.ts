import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IMsg, IMsgType } from 'models/IMessage';
import { IPeerJs } from 'models/peerjs';
import { from, Subject } from 'rxjs';
import { delay, filter, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { SocketService } from '../socket.service';
// const Peer:
@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.scss'],
})
export class CallComponent implements OnInit, OnDestroy {
  @Input() room: string = '';
  localStream!: MediaStream;
  remoteStreams: MediaStream[] = [];
  id: string = '';
  initiator = false;
  myPeer!: IPeerJs;
  peers: {
    [id: string]: any;
  } = {};

  end$ = new Subject();

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
          from(import('./../../assets/peerjs.js'))
        )
      )
      .pipe(takeUntil(this.end$), delay(500))
      .subscribe((data) => {
        this.initiator = this.service.host;
        this.myPeer = new data.default(this.id) as IPeerJs;
        this.myPeer.on('open', (id) => {
          console.log(id);
          this.sendMessage('', 'room-joined');
        });
        this.myPeer.on('call', (call) => {
          call.answer(this.localStream);
          console.log(call);
          call.on('stream', (stream: MediaStream) => {
            this.remoteStreams.push(stream);
          });
        });
        this.service.member$.subscribe((data) => {
          console.log(data.type);
          switch (data.type) {
            case 'user-connected':
              this.connectToNewUser(data.id, this.localStream);
              break;
            case 'user-disconnected':
              this.peers[data.id].close();
              break;
          }
        });
      });
  }
  connectToNewUser(userId: string, stream: MediaStream) {
    const call = this.myPeer.call(userId, stream);
    // console.log(call);
    call.on('stream', (stream: MediaStream) => {
      this.remoteStreams.push(stream);
    });
    call.on('close', () => {
      this.peers[call.peer].close();
    });

    this.peers[userId] = call;
    console.log(this.peers);
  }

  addRemoteStream() {}
  sendMessage(message: string, type: IMsgType = 'call') {
    const msg: IMsg = {
      message,
      room: this.room,
      id: this.id,
      type,
    };
    this.service.sendMessage(msg);
  }

  ngOnDestroy() {
    this.end$.next(1);
  }
}
