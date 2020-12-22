export interface IMsg {
  type: 'connection' | 'message' | 'join-room';
  message: string;
  id: string;
  time?: Date;
  room?: string;
}
