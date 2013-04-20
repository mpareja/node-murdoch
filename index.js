var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server);

app.use(express.static('public'));
server.listen(8080);

sockets = [];

io.sockets.on('connection', function (socket) {
  sockets.push(socket);

  socket.emit('init', {
    "applyChangesToReporting": [],
    "updateLanguageStrings": [],
    "deployDbChanges": ['updateLanguageStrings', 'applyChangesToReporting']
  });
});

var net = require("net"),
    repl = require("repl");

net.createServer(function (socket) {
  repl.start({
    prompt: "murdoch: ",
    input: socket,
    output: socket
  }).on('exit', function() {
    socket.end();
  });
}).listen(8082);
 
