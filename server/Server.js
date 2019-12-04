const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = (module.exports.io = require('socket.io')(server));
const mongoose = require('mongoose');

mongoose
  .connect(
    'mongodb+srv://socket_chat_io:socket_chat_io@cluster01-gnpv7.mongodb.net/socket_chat_io?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(db => {
    //console.log(db);
  })
  .catch(error => {
    console.log('Error to connect \n', error);
  });

const PORT = process.env.PORT || 3231;

const SocketManager = require('./SocketManager');

app.use(express.static(__dirname + '/../../build'));
io.on('connection', SocketManager);

server.listen(PORT, () => {
  console.log('Connected to port:', PORT);
});
