export type IMsgType =
  | 'connection'
  | 'message'
  | 'join-room'
  | 'call'
  | 'offer'
  | 'answer'
  | 'welcome'
  | 'bye'
  | 'stream'
  | 'share'
  | 'room-created'
  | 'room-joined'
  | 'debug';

export interface IMsgData {
  room: string;
  id: string;
  message: string;
}

export interface IMsg {
  type: IMsgType;
  message: string;
  data?: IMsgData;
  id: string;
  time?: Date;
  room?: string;
  label?: any;
  candidate?: any;
}
