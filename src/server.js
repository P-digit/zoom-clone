import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

const sockets = [];

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Put all your backend code here.

function socketClose() {
  console.log("Disconnecting server ");
}

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket.on("message", (message) => {
    const messageData = JSON.parse(message);
    console.log(messageData);
    switch (messageData.type) {
      case "nickname":
        socket["nickname"] = messageData.payload;
        console.log(socket.nickname);
        break;
      default:
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname}: ${messageData.payload}`)
        );
    }
  });
  socket.on("close", socketClose);
});

server.listen(process.env.PORT, handleListen);
