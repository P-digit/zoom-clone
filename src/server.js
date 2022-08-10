// import WebSocket, { WebSocketServer } from "ws";
import express from "express";
import * as url from "url";
import http from "http";
import { Server } from "socket.io";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");

const httpServer = http.createServer(app);
const ioServer = new Server(httpServer);

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

httpServer.listen(3000, handleListen);

ioServer.on("connection", (socket) => {
  socket.on("enter_room", (roomName, done) => {
    console.log(roomName);
    done(roomName);
  });
}); // 프론트엔드에서 설정한 이름과 같아야 한다. 프론트엔드에서 설정된 함수를 백엔드가 신호를 보내 프론트엔드에서 실행되도록 설정 가능 (argument 입력 가능)
