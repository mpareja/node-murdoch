jQuery(function ($) {
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
  window.murdoch = {
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
    var tasks = Object.keys(_plan);
    var tasksHtml = tasks.map(function (task) {
      var name = camelToWords(task);
      return taskTemplate({name: name});
    }).join();

    $taskList.html('');
    $taskList.append(tasksHtml);

    var els = $('#taskList li .progress');
    for(var i = 0; i < els.length; i++) {
      var task = tasks[i];
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
});

$(function () {
  var socket = io.connect('http://localhost:8080');
  socket.on('init', function (data) {
    murdoch.initialize(data);
  });

  socket.on('complete', function (task) {
    murdoch.complete(task);
  });
});
