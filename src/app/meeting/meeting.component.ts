import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ICall, IPeerIterable } from 'models/ICall.js';
import { IMsg } from 'models/IMessage.js';
import { IPeerJs } from 'models/peerJS.js';
import { from } from 'rxjs';
import { tap, mergeMap, take } from 'rxjs/operators';
import { SocketService } from '../socket.service.js';
@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
})
export class MeetingComponent implements OnInit, OnChanges, OnDestroy {
  @Input() events!: IMsg;
  localStream!: MediaStream;
  peers = new Map<string, IPeerIterable>();
  // remoteStreams = this.peers.values();
  myPeer!: IPeerJs;
  name!: string;
  audioEnabled = false;

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
            this.stopCall(m.id);
            break;
        }
      }
    }
  }
  ngOnDestroy() {
    this.myPeer.destroy();
  }

  startCall() {
    this.service.sendMessage(this.service.id, this.service.room, 'available');
  }

  stopCall(id: string) {
    this.peers.get(id)?.call.close();
    this.peers.delete(id);
  }

  muteMyself() {
    this.audioEnabled = !this.audioEnabled;
    this.localStream.getAudioTracks()[0].enabled = this.audioEnabled;
  }

  videoStartStop() {
    this.localStream.getVideoTracks()[0].enabled = !this.localStream.getVideoTracks()[0]
      .enabled;
  }

  initVideo() {
    from(navigator.mediaDevices.getUserMedia({ audio: true, video: true }))
      .pipe(
        tap((stream) => {
          this.localStream = stream;
          this.localStream.getAudioTracks()[0].enabled = this.audioEnabled;
        }),
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
          console.log('call', call);
          this.connectToNewUser(call);
        });
      });
  }

  connectToNewUser(call: ICall) {
    console.log('connectToNewUser');

    call.on('stream', (stream: MediaStream) => {
      call.username = this.service.getAttendeeName(call.peer);
      const peerObj: IPeerIterable = {
        name: call.username,
        call,
        stream,
      };
      console.log('connectToNewUser', peerObj);
      if (!this.peers.has(call.peer)) {
        this.peers.set(call.peer, peerObj);
        console.log('connectToNewUser', this.peers);
      }
    });
    call.on('close', () => {
      this.stopCall(call.peer);
    });
  }
}
