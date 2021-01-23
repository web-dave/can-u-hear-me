import { IEvent } from './IEvent';

export interface IPeerIterable {
  name: string;
  stream: MediaStream;
  call: ICall;
}
export interface ICall {
  events: any;
  eventsCount: number;
  peer: string;
  provider: any;
  options: {
    [id: string]: MediaStream;
  };
  metadata: any;
  localStream: MediaStream;
  connectionId: string;
  negotiator: any;
  peerConnection: RTCPeerConnection;
  remoteStream: MediaStream;
  open: boolean;
  answer(stream: MediaStream): void;
  close(): void;
  on(
    event: IEvent,
    fn: {
      (param1?: any, param2?: any): void;
    }
  ): void;
  username: string;
  send(...args: any): void;
}
