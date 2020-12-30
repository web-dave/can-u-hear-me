import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IMsg, IMsgType } from 'models/IMessage';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.scss'],
})
export class CallComponent implements OnInit, OnDestroy {
  @Input() room: string = '';
  callActive: boolean = false;
  pc: any;
  localStream!: MediaStream;
  remoteStream!: MediaStream;
  id: string = '';
  isStarted = false;

  end$ = new Subject();

  constructor(private service: SocketService) {}

  ngOnInit(): void {
    this.service.id$
      .pipe(
        takeUntil(this.end$),
        filter((data) => data !== '')
      )
      .subscribe((data) => this.setupWebRtc(data));
  }

  setupWebRtc(data: string) {
    this.id = data;
    try {
      this.pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.services.mozilla.com' },
          { urls: 'stun:stun.l.google.com:19302' },
        ],
      });
    } catch (error) {
      console.log(error);
      this.pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.services.mozilla.com' },
          { urls: 'stun:stun.l.google.com:19302' },
        ],
      });
    } finally {
      console.log('PC', this.pc);

      this.pc.onicecandidate = (event: any) => {
        console.log(event);

        event.candidate
          ? this.sendMessage(JSON.stringify({ ice: event.candidate }))
          : console.log('Sent All Ice');
      };

      this.pc.onremovestream = (event: RTCPeerConnection) => {
        console.log('Stream Ended');
      };

      this.pc.ontrack = (event: { streams: MediaStream[] }) =>
        (this.remoteStream = event.streams[0]);

      this.pc.onaddstream = (event: any) => {
        console.log('Remote stream added.', event);
        this.remoteStream = event.stream;
      };

      this.showMe();
    }
  }

  showMe() {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        this.localStream = stream;
        this.pc.addStream(stream);
      });
  }

  // readMessage(data: any) {
  //   if (!data) return;
  //   try {
  //     var msg = JSON.parse(data.val().message);
  //     let personalData = data.val().personalData;
  //     var sender = data.val().sender;
  //     if (sender != this.id) {
  //       if (msg.ice != undefined && this.pc != null) {
  //         this.pc.addIceCandidate(new RTCIceCandidate(msg.ice));
  //       } else if (msg.sdp.type == 'offer') {
  //         this.callActive = true;
  //         this.pc
  //           .setRemoteDescription(new RTCSessionDescription(msg.sdp))
  //           .then(() => this.pc.createAnswer())
  //           .then((answer: any) => this.pc.setLocalDescription(answer))
  //           .then(() =>
  //             this.sendMessage(
  //               JSON.stringify({ sdp: this.pc.localDescription })
  //             )
  //           );
  //       } else if (msg.sdp.type == 'answer') {
  //         this.callActive = true;
  //         this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

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
