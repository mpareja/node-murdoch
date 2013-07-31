var deppy = require('deppy');
var JSONStream = require('JSONStream');
var taskTemplate = _.template($("#taskTemplate").html());
var $taskList = $('#taskList');

var _completed, _deps, _tasks;
var murdoch = module.exports = {
  initialize: function (plan) {
    _completed = {};
    _deps = deppy.create();

    // populate dependency graph
    Object.keys(plan).forEach(function (task) {
      _deps(task, plan[task]);
    });

    // TODO: a topological sort would be nice
    _tasks = Object.keys(plan).sort(function (a, b) {
      var ra = _deps.resolve(a).length;
      var rb = _deps.resolve(b).length;
      return ra === rb ? a.localeCompare(b) : ra - rb;
    });

    renderAllTasks();
    updateProgress();
  },
  complete: function (task) {
    _completed[task] = true;
    updateProgress();
  }
};

function renderAllTasks() {
  // render tasks
  var tasksHtml = _tasks.map(function (task) {
    var name = camelToWords(task);
    return taskTemplate({name: name});
  }).join();

  $taskList.html('');
  $taskList.append(tasksHtml);
}

function updateProgress() {
  var els = $('#taskList li .progress');
  for(var i = 0; i < els.length; i++) {
    var task = _tasks[i];
    var requiredTasks = _deps.resolve(task);
    var completeCount = requiredTasks.filter(function (task) {
      return !!_completed[task];
    }).length * 1.0;

    $(els[i]).progressbar({
      label: name,
      value: 100.0 * (completeCount / requiredTasks.length * 1.0),
      change: function () {
        $('#taskList .progress-label').text(task);
      }
    });
  }
}

function camelToWords(camel) {
  if (!camel) { return ''; }
  var words = camel.replace(/([A-Z])/g, ' $1').substring(1).toLowerCase();
  return camel[0].toUpperCase() + words;
}

(function () {
  var shoe = require('shoe');
  var es = require('emit-stream');
  var stream = shoe('/stream').pipe(JSONStream.parse([true]));
  var rupert = es(stream);
  rupert.on('init', function (data) {
    murdoch.initialize(data);
  });

  rupert.on('taskComplete', function (task) {
    murdoch.complete(task);
  });
}());

