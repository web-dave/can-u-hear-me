const WebSocket = require("ws");
const { v4: getID } = require("uuid");

const clients = [];
const roomRaw = {
  id: "",
  clients: [],
  host: null,
};
const rooms = {};

const wss = new WebSocket.Server({ port: 3002 });

wss.on("connection", (client) => {
  clients.push(client);
  const id = getID();
  const msg = {
    type: "connection",
    message: "Welcome",
    id: id,
  };
  client.send(JSON.stringify(msg));
  msg.message = "New User";
  clients.forEach((c) => {
    if (c !== client) {
      c.send(JSON.stringify(msg));
    }
  });
  client.on("close", () => {
    const roomList = Object.keys(rooms);
    clients.forEach((c, i) => {
      if (c === client) {
        clients.splice(i, 1);
      }
    });
    roomList.forEach((r) => {
      rooms[r].clients.forEach((c, i) => {
        if (c === client) {
          rooms[r].clients.splice(i, 1);
        }
      });
    });
  });
  client.on("message", (m) => {
    const msg = JSON.parse(m);
    console.log(msg.type);
    switch (msg.type) {
      case "join-room":
        if (!rooms[msg.message]) {
          rooms[msg.message] = {
            id: msg.message,
            clients: [],
            host: client,
          };
        }
        rooms[msg.message].clients.push(client);
        const m = {
          ...msg,
          room: msg.message,
          time: new Date(),
          message: "Welcome",
          type: "message",
        };
        rooms[msg.message].clients.forEach((c) => {
          c.send(JSON.stringify(rooms));
        });
        rooms[msg.message].clients.forEach((c) => {
          c.send(JSON.stringify(m));
        });
        break;
      case "message":
        console;
        if (rooms[msg.room]) {
          rooms[msg.room].clients.forEach((c) => {
            c.send(JSON.stringify(msg));
          });
        } else {
          console.log("room", msg.room, "not found");
        }
        break;
    }
  });
});
