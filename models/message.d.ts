export interface IMsg {
  type: 'connection' | 'message' | 'join-room' | 'call';
  message: string;
  id: string;
  time?: Date;
  room?: string;
}
