var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server);

var tasks = {};
for (var i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
  var c = String.fromCharCode(i);
  tasks[c] = function (cb) {
    setTimeout(function () { cb(null); }, Math.random() * 2500.0);
  };
}

var plan = {
  'a': ['b', 'c', 'd'],
  'b': ['c', 'd', 'e'],
  'c': ['d', 'e', 'f'],
  'd': ['e', 'f', 'g'],
  'e': ['f', 'g', 'h'],

  'f': ['p', 'q', 'r'],
  'g': ['q', 'r', 's'],
  'h': ['r', 's', 't'],

  'i': ['u', 'v', 'w'],
  'j': ['v', 'w', 'x'],
  'k': ['w', 'x', 'y'],
  'l': ['x', 'y', 'z'],
  'm': ['y', 'z', 'u'],
  'n': ['z', 'u', 'v'],
  'o': ['u', 'v', 'w'],

  'p': ['i', 'j', 'k'],
  'q': ['j', 'k', 'l'],
  'r': ['k', 'l', 'm'],
  's': ['l', 'm', 'n'],
  't': ['m', 'n', 'o'],

  'u': ['v', 'w', 'x'],
  'v': ['w', 'x', 'y'],
  'w': ['x', 'y', 'z'],
  'x': ['y', 'z'],
  'y': ['z'],
  'z': [],
};

var rupert = require('rupert');
app.use(express.static('public'));
server.listen(8080);

sockets = [];

io.sockets.on('connection', function (socket) {
  sockets.push(socket);

  socket.emit('init', plan);

  var r = rupert(tasks, plan, function (err) {
    socket.disconnect();
  });
  r.on('taskComplete', function (task) {
    socket.emit('complete', task);
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
 
