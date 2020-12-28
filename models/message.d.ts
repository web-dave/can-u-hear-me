export interface IMsg {
  type:
    | 'connection'
    | 'message'
    | 'join-room'
    | 'call'
    | 'offer'
    | 'answer'
    | 'candidate'
    | 'bye';
  message: string;
  id: string;
  time?: Date;
  room?: string;
}
