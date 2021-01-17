import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ICall } from 'models/ICall.js';
import { IMsg } from 'models/IMessage.js';
import { IPeerJs } from 'models/peerJS.js';
import { from } from 'rxjs';
import { tap, mergeMap, take } from 'rxjs/operators';
import { SocketService } from '../socket.service.js';
@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
})
export class MeetingComponent implements OnInit, OnChanges {
  @Input() events!: IMsg;
  localStream!: MediaStream;
  remoteStreams: {
    stream: MediaStream;
    call: ICall;
  }[] = [];
  myPeer!: IPeerJs;
  name!: string;

  constructor(private service: SocketService) {}

  ngOnInit(): void {
    this.name = this.service.name;
    this.initVideo();
  }

  ngOnChanges(change: SimpleChanges): void {
    console.log(change);
    if (change.events) {
      if (change.events.currentValue && this.myPeer) {
        const m: IMsg = change.events.currentValue;
        switch (m.type) {
          case 'available':
            const call = this.myPeer.call(m.id, this.localStream);
            this.connectToNewUser(call);
            break;
          case 'leave':
            this.remoteStreams.forEach((rs, i) => {
              if (rs.call.peer === m.id) {
                this.stopCall(rs.call, rs.stream, i);
              }
            });
            break;
        }
      }
    }
  }

  startCall() {
    this.service.sendMessage(this.service.id, this.service.room, 'available');
  }

  stopCall(call: ICall, stream: MediaStream, i: number) {
    call.close();
    this.remoteStreams.splice(i, 1);
  }

  initVideo() {
    from(navigator.mediaDevices.getUserMedia({ audio: false, video: true }))
      .pipe(
        tap((stream) => (this.localStream = stream)),
        // @ts-ignore
        mergeMap(() => from(import('./../../assets/peer.js')))
      )
      .pipe(take(1))
      .subscribe((data) => {
        this.myPeer = new data.default(this.service.id) as IPeerJs;
        this.myPeer.on('open', (id: string) => {
          console.log(id);
        });
        this.myPeer.on('call', (call: ICall) => {
          call.answer(this.localStream);
          this.connectToNewUser(call);
        });
      });
  }

  connectToNewUser(call: ICall) {
    call.on('stream', (stream: MediaStream) => {
      call.username = this.service.getAttendeeName(call.peer);
      this.remoteStreams.push({
        stream,
        call,
      });
    });
    call.on('close', () => {
      call.close();
    });
  }
}
