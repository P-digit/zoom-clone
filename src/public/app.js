const socket = new WebSocket(`wss://${window.location.host}`);

const nick = document.getElementById("nick");
const room = document.getElementById("room");
const msg = document.getElementById("msg");

room.hidden = true;

function makeMessage(type, payload) {
  const msg = { type: type, payload: payload };
  return msg;
}

function paintNickname() {
  const input = nick.querySelector("input");
  const welcomeBar = document.getElementById("welcomeBar");
  let nickName;
  if (input.value !== "") {
    nickName = input.value;
  } else {
    nickName = "Anonymous";
  }
  welcomeBar.innerText = `Welcome to Noom,  ${nickName}`;
  socket.send(makeMessage("nickname", nickName));
  input.value = "";
}

function paintRoom() {
  room.hidden = false;
  nick.hidden = true;
}

function handleNickname(event) {
  event.preventDefault();
  paintNickname();
  paintRoom();
}

function handleSendMessage(event) {
  const message = msg.querySelector("input");

  socket.send(makeMessage("new_message", message.value));
  event.preventDefault();
  message.innerText = "";
}

function handleChatMessage(message) {
  const li = document.createElement("li");
  const chatList = room.querySelector("ul");

  li.innterText = message;
  chatList.appendChild(li);
}

socket.addEventListener("message", handleChatMessage);
nick.addEventListener("submit", handleNickname);
msg.addEventListener("submit", handleSendMessage);
