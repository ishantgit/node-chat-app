const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

var redis = require('redis');
var redisClient = redis.createClient({host : 'localhost', port : 6379});

redisClient.on('ready',function() {
 console.log("Redis is ready");
});

redisClient.on('error',function() {
 console.log("Error in Redis");
});



const {generateMessage,generateLocationMessage} = require('./utils/message.js');
const {isRealString} = require('./utils/validation.js');
const {Users} = require('./utils/users.js');
const publicPath = path.join(__dirname,'../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();


app.use(express.static(publicPath));
var chatters = [];

// Store messages in chatroom
var chat_messages = [];



io.on('connection',(socket)=>{
  console.log('new user connected');

  socket.on('createMessage',(message,callback) => {
    var user = users.getUser(socket.id);
    if(user && isRealString(message.text)){
      io.to(user.room).emit('newMessage',generateMessage(user.name,message.text));
      chatters.push(generateMessage(user.name,message.text));
      redisClient.set("chatters",JSON.stringify(chatters),function(err,reply){
        console.log(err);
        console.log(reply);
      });
      redisClient.get("chatters",function(err,reply){
        console.log(err);
        console.log(reply);
      });
    }
    callback('This is from server');
    // socket.broadcast.emit('newMessage',{
    //   from:message.from,
    //   text:message.text,
    //   createdAt: new Date().getTime()
    // });
  });

  socket.on('join',(params,callback) => {
    if(!isRealString(params.name) || !isRealString(params.room)){
      callback('name and room name are required');
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id,params.name,params.room);
    io.to(params.room).emit('updateUserList',users.getUserList(params.room));
    //socket.leave(room)
    // io.emit() -> io.to(room).emit()
    //scoket.broadcast.emit() -> socket.broadcast.to(room).emit()
    //socket.emit()


    socket.emit('newMessage',generateMessage('Admin','Welcome to Chat App.'));
    socket.broadcast.to(params.room).emit('newMessage',generateMessage('Admin',`${params.name} has joined`));
    callback();
  });

  socket.on('createLocationMessage',(coords,callback) => {
    var user = users.getUser(socket.id);
    if(user){
      io.to(user.room).emit('newLocationMessage',generateLocationMessage(user.name,coords.latitude, coords.longitude));
    }
    callback('message send')
  });

  socket.on('disconnect',() => {
    console.log('User was disconnected');
    var user = users.removeUser(socket.id);

    if(user){
      io.to(user.room).emit('updateUserList',users.getUserList(user.room));
      io.to(user.room).emit('newMessage',generateMessage('Admin',`${user.name} has left the ${user.room}`));
    }
  });

  // socket.on('createEmail',(newEmail) => {
  //   console.log('createEmail',newEmail);
  // });

  // socket.emit('newMessage',{
  //   from: 'Me',
  //   text: 'this is Me',
  //   createdAt: 1231213
  // });
});

server.listen(port,() => {
  console.log(`server is up at port ${port}`);
});
