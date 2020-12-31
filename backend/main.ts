import { IMsg } from '../models/IMessage';
import * as WebSocket from 'ws';
import { IRoomList } from '../models/IRoomList';
const { v4: getID } = require('uuid');

const clients: WebSocket[] = [];
const rooms: IRoomList = {};

const wss = new WebSocket.Server({ port: 3002 });

wss.on('connection', (client: WebSocket) => {
  clients.push(client);
  const id = getID();
  client.send(JSON.stringify(client));
  const msg = {
    type: 'connection',
    message: 'Welcome',
    id: id,
  };
  client.send(JSON.stringify(msg));

  client.on('close', () => {
    const roomList = Object.keys(rooms);
    clients.forEach((c, i) => {
      if (c === client) {
        clients.splice(i, 1);
      }
    });
    roomList.forEach((r) => {
      if (rooms[r].clients.includes(client)) {
        rooms[r].clients.forEach((c) => {
          if (c !== client) {
            const msg = {
              type: 'user-disconnected',
              message: 'left',
              id: id,
            };
            client.send(JSON.stringify(msg));
          }
        });
      }
      rooms[r].clients.forEach((c, i) => {
        if (c === client) {
          rooms[r].clients.splice(i, 1);
        }
      });
    });
    roomList.forEach((r) => {
      if (rooms[r].clients.length === 0) {
        delete rooms[r];
      }
    });
  });

  client.on('message', (m: string) => {
    const msg: IMsg = JSON.parse(m);
    console.log(msg.type);
    switch (msg.type) {
      case 'room-joined':
        if (msg.room) {
          if (!rooms[msg.room]) {
            rooms[msg.room] = {
              id: msg.room,
              clients: [],
            };
          }
          rooms[msg.room].clients.push(client);
          rooms[msg.room].clients.forEach((c) => {
            if (c !== client) {
              c.send(JSON.stringify({ ...msg, type: 'user-connected' }));
            }
          });
        }
        break;
      case 'join-room':
        if (!rooms[msg.message]) {
          rooms[msg.message] = {
            id: msg.message,
            clients: [],
          };
          client.send(
            JSON.stringify({
              room: msg.message,
              type: 'room-created',
              message: 'Room created, you are host!!',
              id: id,
            })
          );
        }
        rooms[msg.message].clients.push(client);
        rooms[msg.message].clients.forEach((c) => {
          if (c !== client) {
            c.send(
              JSON.stringify({
                id: id,
                room: msg.message,
                time: new Date(),
                message: 'Welcome',
                type: 'user-connected',
              })
            );
          }
        });
        rooms[msg.message].clients.forEach((c) => {
          c.send(
            JSON.stringify({
              ...msg,
              room: msg.message,
              time: new Date(),
              message: rooms,
              type: 'rooms',
            })
          );
        });
        break;
      case 'message':
        if (!msg.room) {
          return;
        }
        if (rooms[msg.room]) {
          rooms[msg.room].clients.forEach((c) => {
            c.send(JSON.stringify(msg));
          });
        } else {
          console.log('room', msg.room, 'not found');
        }
        break;
    }
  });
});
