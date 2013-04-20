var murdoch = (function ($) {
  var taskTemplate = _.template($("#taskTemplate").html());
  var $taskList = $('#taskList')

  /*
  function Emitter() {
    this.handlers = {};
  }
  Emitter.prototype.emit = function (event, data) {
    var handlers = this.handlers[event] || [];
    if (this.handlers.length) {
      handlers.forEach(function (handler) {
        handler(data);
      });
    }
  };
  Emitter.prototype.on = function (event, handler) {
    var handlers = this.handlers[event] || (this.handlers[event] = []);
    handlers.push(handler);
  };
  */

  var _completed, _plan, _deps;
  var exports = {
    initialize: function (plan) {
      _plan = plan;
      _completed = {};
      _deps = deppy.create();

      // populate dependency graph
      Object.keys(plan).forEach(function (task) {
        _deps(task, plan[task]);
      });

      renderAll();
    },
    complete: function (task) {
      _completed[task] = true;
      renderAll();
    }
  };

  function renderAll() {
    $taskList.html('');

    Object.keys(_plan).forEach(function (task) {
      renderTask(task, _plan[task]);
    });
  }

  function renderTask(task, deps) {
    var requiredTasks = _deps.resolve(task);
    var completeCount = requiredTasks.filter(function (task) {
      return !!_completed[task];
    }).length * 1.0;

//    var total = deps.length + 1;
    var name = camelToWords(task);
    var taskHtml = taskTemplate({name: name});

    $taskList.append(taskHtml);

    $('#taskList li :last .progress').progressbar({
      label: name,
      value: 100.0 * (completeCount / requiredTasks.length * 1.0),
      change: function () {
        $('#taskList .progress-label').text(task);
      }
    });
  }

  function camelToWords(camel) {
    if (!camel) { return ''; }
    var words = camel.replace(/([A-Z])/g, ' $1').substring(1).toLowerCase();
    return camel[0].toUpperCase() + words;
  }

  return exports;
}(jQuery));

$(function () {
  var socket = io.connect('http://localhost:8080');
  socket.on('init', function (data) {
    murdoch.initialize(data);
  });

  socket.on('complete', function (task) {
    murdoch.complete(task);
  });
});
