export interface IPeerConf {
  initiator?: boolean;
  channelConfig?: {};
  channelName?: string;
  config?: { iceServers?: { urls?: string }[] };
  offerOptions?: {};
  answerOptions?: {};
  sdpTransform?(sdp: any): any;
  stream?: boolean;
  streams?: [];
  trickle?: boolean;
  allowHalfTrickle?: boolean;
  wrtc?: {};
  objectMode?: boolean;
}

export interface ISimplePeer {
  signal(data: any): void;
  send(data: String | ArrayBuffer | Blob): void;
  addStream(stream: MediaStream): void;
  removeStream(stream: MediaStream): void;
  addTrack(track: MediaStreamTrack, stream: MediaStream): void;
  replaceTrack(
    oldTrack: MediaStreamTrack,
    newTrack: MediaStreamTrack,
    stream: MediaStream
  ): void;
  addTransceiver(kind: string, init: any): void;
  destroy(error?: any): void;
  WEBRTC_SUPPORT: boolean;
  on(
    event:
      | 'signal'
      | 'stream'
      | 'connect'
      | 'data'
      | 'data'
      | 'track'
      | 'close'
      | 'error',
    fn: {
      (param1?: any, param2?: any): void;
    }
  ): void;
}
