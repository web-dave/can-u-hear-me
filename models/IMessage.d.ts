export type IMsgType =
  | 'connection'
  | 'message'
  | 'join'
  | 'list'
  | 'leave'
  | 'available';
export interface IMsg {
  type: IMsgType;
  message: any;
  id: string;
}
