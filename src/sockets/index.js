const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const redis = require('../config/redis');
const chatHandler = require('./chatHandler');

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  const pubClient = redis.duplicate();
  const subClient = redis.duplicate();

  io.adapter(createAdapter(pubClient, subClient));

  io.on('connection', (socket) => {
    console.log(`👀 User connected: ${socket.id}`);

    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(` ✌ User ${userId} joined their room`);

      ///----------------------
      io.of("/").adapter.rooms.forEach((sockets,room)=>{
       console.log("Room:",room,"Sockets",sockets.size);
      });
    });


    chatHandler(io, socket);
    socket.on('disconnect', () => {
      console.log(`👍 User disconnected: ${socket.id}`);
    });
    
  });

  return io;
};






