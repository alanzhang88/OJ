const express = require("express");
const socketIO = require("socket.io");
const http = require("http");
const axios = require("axios");
const path = require("path");

const publicPath = path.join(__dirname,"..","/client");
var port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

// var clients = {};

io.on("connection",(socket)=>{
  console.log("User connected ",socket.id);
  socket.broadcast.emit("newuserJoin",{id:socket.id});
  // clients[socket.id] = socket;

  socket.on("newuserInfo",function(msg){
    console.log("Recv info from a client, sending to the other", msg.id, socket.id);
    // console.log("Recv clients", clients[msg.id]);
    // clients[msg.id].emit("newuserSync",msg);
    io.to(msg.id).emit("newuserSync",msg);
  });

  socket.on("newPatch",function(e){
    console.log("Recv a text change from a client");
    socket.broadcast.emit("patchText",e);
  });

  socket.on("newCursorPos",function(msg){
    console.log("Recv new cursor position from a client");
    socket.broadcast.emit("cursorPosUpdate",msg);
  });

  socket.on("codeToRun",function(codes){
    console.log("Recv codes to run from client sending to executor");
    axios.request({
      url: "/exec",
      baseURL: "http://127.0.0.1:5000",
      method: "post",
      data: codes,
      responseType: "json"
    }).then((response)=>{
      if(response.status === 200){
        console.log("Recv results from executor",response.data);
        io.emit("codeResult",response.data);
        //socket.broadcast.emit("codeResult",response.data);
      }
    }).catch((e)=>{
      console.log("Error ",e);
    });
  });


  socket.on("disconnect",()=>{
    console.log("User disconnected");
    // delete clients[socket.id];
    socket.broadcast.emit("userdisconnect",{id:socket.id});
  });

});


server.listen(port,()=>{
  console.log(`Server start listening on port ${port}`);
});
