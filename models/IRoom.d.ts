import * as WebSocket from 'ws';

export interface IRoom {
  id: string;
  clients: WebSocket[];
  host: WebSocket | null;
}
