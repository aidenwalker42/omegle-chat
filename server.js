const express = require("express");
const app = express();

app.use(express.static("public"));

const server = require("http").Server(app);
const io = require("socket.io")(server, {
  cors: { origin: "*" },
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

const port = process.env.PORT || 5500;
server.listen(port, () => {
  console.log(port + " running");
});

let waitingRooms = [];
let fullRooms = [];
let oc = 0;

io.sockets.on("connection", (socket) => {
  let room;
  console.log("User Connected: " + socket.id);
  oc++;
  io.emit("oc", oc)
  socket.on("room", (condition) => {
    if(condition){
      socket.broadcast.to(room).emit("message", "User DC");
      socket.broadcast.to(room).emit("user left");
      searchForRoom(room)
      ? waitingRooms.splice(waitingRooms.indexOf(room), 1)
      : fullRooms.splice(fullRooms.indexOf(room), 1);
      socket.leave(room)
    }
    if (waitingRooms.length === 0) {
      //if no one in waiting room then the room is equal to their socket id
      room = socket.id + "ROOM";
      waitingRooms.push(room); //and we push the socket id to the waiting array
      socket.join(room); //join the room
      io.sockets.in(room).emit("server message", "Waiting for a user to join...");
    } else if (waitingRooms.length === 1) {
      //else the room is the person in the waiting room
      room = waitingRooms[0];
      fullRooms.push(waitingRooms[0]); //and we add the waiting room to the full rooms array
      waitingRooms.splice(0, 1); //and remove from waiting room array
      socket.join(room);
      io.sockets.in(room).emit("server message", "User is connected, say hi!");
    } else {
      socket.emit("error", "error joining room");
      return;
    }
    // console.log("User: " + socket.id);
    // console.log("Joining: " + room);
    console.log("Waiting: [" + waitingRooms + "]");
    console.log("Full: [" + fullRooms + "]");
  });
  socket.on("message", (msg) => {
    if (room) {
      socket.broadcast.to(room).emit("message", msg);
    }
  });
  socket.on("disconnect", () => {
    oc--;
    io.emit("oc", oc);
    searchForRoom(room)
      ? waitingRooms.splice(waitingRooms.indexOf(room), 1)
      : fullRooms.splice(fullRooms.indexOf(room), 1);
    io.sockets.in(room).emit("message", "User DC");
    io.sockets.in(room).emit("user left");
    socket.leave(room)

    console.log("User left: " + socket.id);
    console.log("Waiting: [" + waitingRooms + "]");
    console.log("Full: [" + fullRooms + "]");
  });
  socket.on("leave room", () => {
    socket.leave(room);
    console.log("LEFT THE ROOM")
  })
});

function searchForRoom(theRoom) {
  if (waitingRooms.indexOf(theRoom) > -1) {
    return true;
  }
  if (fullRooms.indexOf(theRoom) > -1) {
    return false;
  }
}
