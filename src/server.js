import express from "express";
import * as url from "url";
import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

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
});

server.listen(3000, handleListen);
