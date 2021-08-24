const socket = io.connect("ws://localhost:5500");
let form = document.getElementById("form");
let input = document.getElementById("input");
let room = false;
function joinRoom() {
  if (!room) {
    socket.emit("room");
    room = true;
  } else {
    console.log("You already joined a room");
  }
}

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input.value && room) {
    //if not blank
    let msg = input.value;
    socket.emit("message", msg);
    console.log("You: " + msg);
    input.value = ""; //clear
  } else {
    console.log("join a room");
  }
});

socket.on("message", function (data) {
  console.log("Stranger:" + data);
});

socket.on("error", (msg) => {
  console.log(msg);
});

socket.on("user left", () => {
  room = false;
});
