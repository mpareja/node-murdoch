// server static files
var server = createStaticFileServer();
pipeRupertEventsToBrowser(server);
enableAutoBrowserify();

function createStaticFileServer() {
  var http = require('http');
  var ecstatic = require('ecstatic')(__dirname + '/public');
  var server = http.createServer(ecstatic);
  server.listen(8080);
  return server;
}

function pipeRupertEventsToBrowser(server) {
  var rupert = require('rupert');
  var es = require('emit-stream');
  var JSONStream = require('JSONStream');
  var shoe = require('shoe');
  var socket = shoe(function (stream) {
    var tp = getTaskPlan();
    var r = rupert(tp.tasks, tp.plan, function (err) {});
    es(r).pipe(JSONStream.stringify()).pipe(stream);
    r.emit('init', tp.plan);
  });
  socket.install(server, '/stream');
}


function getTaskPlan() {
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

  return { tasks: tasks, plan: plan };
};

function enableAutoBrowserify() {
  var watchify = require('watchify')(['./public/client.js']);
  watchify.on('update', updateBundle);
  updateBundle();

  function updateBundle() {
    console.log('Updating bundle.');
    var bundle = watchify.bundle();
    var file = require('fs').createWriteStream('./public/client.min.js');
    bundle.pipe(file);
  }
}

