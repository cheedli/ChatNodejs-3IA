const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const users = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  io.emit('chat message', 'A user has connected.');

  io.emit('online users', Object.keys(users));

  socket.on('set nickname', (nickname) => {
    users[socket.id] = nickname;
    io.emit('chat message', `${nickname} has joined the chat.`);
    io.emit('online users', Object.keys(users));
  });

  socket.on('disconnect', () => {
    const disconnectedUser = users[socket.id];
    delete users[socket.id];
    io.emit('chat message', `${disconnectedUser} has left the chat.`);
    io.emit('online users', Object.keys(users));
  });

  socket.on('chat message', (msg) => {
    socket.broadcast.emit('chat message', { user: users[socket.id], message: msg });
  });

  socket.on('typing', () => {
    socket.broadcast.emit('typing', users[socket.id]);
  });
socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', users[socket.id]);
  });
});
server.listen(3000, () => {
  console.log('listening on *:3000');
});
