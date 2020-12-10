const express = require("express");
const cors = require("cors");
const app = express();
const server = require("http").Server(app);
const { v4: getUuid } = require("uuid");
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 4201 });

const clients = [];

wss.on("connection", (socket) => {
  clients.push(socket);
  clients.forEach((ws) => {
    if (ws !== socket) {
      ws.send(JSON.stringify({ msg: "New Connection: " + clients.length }));
    }
  });
  console.log("New Connection", clients.length);
  socket.on("close", () => {
    clients.forEach((ws, i) => {
      if (ws === socket) {
        clients.splice(i, 1);
      }
    });
    console.log("disconnect", clients.length);
  });
  socket.on("message", (m) => {
    const msg = JSON.parse(m);
    console.log("MESSAGE?", msg.joinroom);
    if (msg.joinroom) {
      const roomId = msg.joinroom;
      clients.forEach((ws) => {
        if (ws !== socket) {
          ws.send(
            JSON.stringify({ msg: "New Connection: " + clients.length, roomId })
          );
        }
      });
    }
  });
});

app.use(express.static("public"));
app.use(cors());

app.get("/", (req, res) => {
  res.send({ roomId: getUuid() });
});

app.get("/:room", (req, res) => {
  res.send(req.params.room);
});

server.listen(3000);
