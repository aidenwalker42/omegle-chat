const socket = io.connect("ws://localhost:5500");
let form = document.getElementById("form");
let input = document.getElementById("input");
let theMessages = document.getElementById("messages");
let onlineCounter = document.querySelector("h6");
let room = false;
socket.on("oc", (oc) => {
  onlineCounter.innerHTML = "Users online: " + oc;
});

function joinRoom() {
  if (!room) {
    socket.emit("room", false); //if you arent in a room anyone can connect to, connect to a new room normally
    room = true;
  } else {
    socket.emit("room", true); //if you are already in a room and want to connect to someone else, it will run the condition in the server, removing the room from the array.
    room = true;
  }
  theMessages.innerHTML = "";
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input.value && room) {
    //if not blank
    let msg = input.value;
    socket.emit("message", msg);
    let item = document.createElement("li");
    item.innerHTML = "<h4 id='you'>You: </h4>" + msg;
    messages.appendChild(item);
    input.value = ""; //clear
    window.scrollTo(0, document.body.scrollHeight);
  } else if (!room) {
    let item = document.createElement("li");
    item.innerHTML =
      "<h4 id='server'>Server: </h4>You havent joined a room yet!";
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  } else {
    let item = document.createElement("li");
    item.innerHTML =
      "<h4 id='server'>Server: </h4>You cannot send a blank message.";
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  }
});

socket.on("message", function (data) {
  let item = document.createElement("li");
  item.innerHTML = "<h4>Stranger: </h4>" + data;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on("server message", (msg) => {
  let item = document.createElement("li");
  item.innerHTML = "<h4 id='server'>Server: </h4>" + msg;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on("error", (msg) => {
  console.log(msg);
});

socket.on("user left", () => {
  room = false;
  socket.emit("leave room");
});

socket.on("dumb fix", () => {
  let tags = document.getElementsByTagName("li");
  for (var i = 0; i < tags.length; i++) {
    if (tags[i].textContent == "Server: Waiting for a user to join...") {
      tags[i].remove();
      break;
    }
  }
});
