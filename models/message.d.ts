export type msgType =
  | 'connection'
  | 'message'
  | 'join-room'
  | 'call'
  | 'offer'
  | 'answer'
  | 'candidate'
  | 'bye'
  | 'user-media'
  | 'room-created'
  | 'debug';

export interface IMsg {
  type: msgType;
  message: string;
  id: string;
  time?: Date;
  room?: string;
  label?: any;
  candidate?: any;
}
