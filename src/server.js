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

wss.on("connection", (socket) => {
  console.log("Connected to Browser !");
  socket.on("close", () => {
    console.log("Disconnect from the Browser.");
  });
  socket.on("message", (message) => {
    console.log(`New Message: ${message.data}`);
  });
  socket.send("Hello!!");
});

server.listen(3000, handleListen);
