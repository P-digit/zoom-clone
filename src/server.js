// import WebSocket, { WebSocketServer } from "ws";
import express from "express";
import * as url from "url";
import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");

const httpServer = http.createServer(app);
const ioServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(ioServer, {
  auth: false,
  mode: "development",
});

/*const wss = new WebSocketServer({ server });

const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anon";
  console.log("Connected to Browser !");
  socket.on("close", () => {
    console.log("Disconnect from the Browser.");
    sockets.pop(socket);
    console.log(sockets);
  });
  socket.on("message", (message) => {
    const msg = JSON.parse(message);
    console.log(msg);
    switch (msg.type) {
      case "new_message":
        sockets.forEach((aSocket) => {
          aSocket.send(`${socket.nickname}: ${msg.payload}`);
        });
        break;
      case "nickname":
        socket["nickname"] = msg.payload;
    }
  });
});*/

function countUser(roomName) {
  return ioServer.sockets.adapter.rooms.get(roomName)?.size;
}

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = ioServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

ioServer.on("connection", (socket) => {
  socket["nickname"] = "Anon";
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("user_count", countUser(roomName));
    socket["current_room"] = roomName;
    socket.to(roomName).emit("welcome", socket.nickname);
    ioServer.sockets.emit("room_change", publicRooms());
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", socket.nickname);
    });
  });
  socket.on("disconnect", () => {
    ioServer.sockets.emit("room_change", publicRooms());
  });

  socket.on("leave_room", () => {
    const current_room = socket["current_room"];
    socket.leave(current_room);
    socket.to(current_room).emit("bye", socket.nickname);
    socket.to(current_room).emit("user_count", countUser(roomName));
    socket.emit("room_change", publicRooms());
  });

  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on("nickname", (nickname) => {
    if (nickname !== "") {
      socket["nickname"] = nickname;
    }
    socket.emit("load_rooms", publicRooms());
  });
}); // 프론트엔드에서 설정한 이름과 같아야 한다. 프론트엔드에서 설정된 함수를 백엔드가 신호를 보내 프론트엔드에서 실행되도록 설정 가능 (argument 입력 가능)

httpServer.listen(3000, handleListen);
