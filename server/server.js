const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage,generateLocationMessage} = require('./utils/message.js');
const publicPath = path.join(__dirname,'../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection',(socket)=>{
  console.log('new user connected');

  socket.emit('newMessage',generateMessage('Admin','Welcome to Chat App.'));

  socket.broadcast.emit('newMessage',generateMessage('Admin','New user joined.'));

  socket.on('createMessage',(message,callback) => {
    console.log('createMessage',message);
    io.emit('newMessage',generateMessage(message.from,message.text));
    callback('This is from server');
    // socket.broadcast.emit('newMessage',{
    //   from:message.from,
    //   text:message.text,
    //   createdAt: new Date().getTime()
    // });
  });

  socket.on('createLocationMessage',(coords,callback) => {
    io.emit('newLocationMessage',generateLocationMessage('Admin',coords.latitude, coords.longitude));
    callback('message send')
  });

  socket.on('disconnect',() => {
    console.log('User was disconnected');
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
