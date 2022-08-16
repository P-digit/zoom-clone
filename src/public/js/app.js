const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");
const nick = document.getElementById("nick");
const leaveBtn = document.getElementById("leave-btn");
const changeNick = document.getElementById("change-nick");

room.hidden = true;
welcome.hidden = true;

let roomName;

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
}

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function paintLobby() {
  nick.hidden = true;
  welcome.hidden = false;
  socket.on("load_rooms", (rooms) => {
    paintRoomList(rooms);
  });
}

function paintNickname() {
  const input = nick.querySelector("input");
  const nickName = welcome.querySelector("h4");
  nickName.innerText = `닉네임: ${input.value}`;
  socket.emit("nickname", input.value);
}

function handleNicknameSubmit(event) {
  event.preventDefault();
  paintNickname();
  paintLobby();
}

function paintRoomList(rooms) {
  const roomList = welcome.querySelector("ul");
  const data = roomList.querySelectorAll("li");

  data.forEach((datum) => {
    roomList.removeChild(datum);
  });

  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  const roomList = welcome.querySelector("ul");
  const rooms = roomList.querySelectorAll("li");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
  console.log(rooms);
  rooms.forEach((room) => {
    roomList.removeChild(room);
  });
}

function handleLeaveRoom(event) {
  const msgList = room.querySelector("ul");
  const msg = msgList.querySelectorAll("li");
  event.preventDefault();
  room.hidden = true;
  nick.hidden = true;
  welcome.hidden = false;
  socket.emit("leave_room");
  msg.forEach((message) => {
    msgList.removeChild(message);
  });
}

function handleChangeNickname(event) {
  event.preventDefault();
  welcome.hidden = true;
  nick.hidden = false;
}

socket.on("welcome", (user) => {
  addMessage(`${user} arrived!`);
});

socket.on("bye", (left) => {
  addMessage(`${left} left ㅠㅠ`);
});

socket.on("room_change", (rooms) => {
  paintRoomList(rooms);
});

socket.on("new_message", (message) => {
  addMessage(message);
});

socket.on("paint_nickname", (nickname) => {});

form.addEventListener("submit", handleRoomSubmit);
room.addEventListener("submit", handleMessageSubmit);
nick.addEventListener("submit", handleNicknameSubmit);
leaveBtn.addEventListener("click", handleLeaveRoom);
changeNick.addEventListener("click", handleChangeNickname);
