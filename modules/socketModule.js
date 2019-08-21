const io = require("socket.io")();
const socketModule = {};

socketModule.io = io;

socketModule.sendMessage = message => {
  io.sockets.emit("message", message);
};

module.exports = socketModule;
