var murdoch = (function ($) {
  var completed = {};
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

  var exports = {
    initialize: function (plan) {
      Object.keys(plan).forEach(function (task) {
        renderTask(task, plan[task]);
      });
    }
  };

  function renderTask(task, deps) {
//    var total = deps.length + 1;
    var taskHtml = taskTemplate({name: camelToWords(task)});

    $taskList.append(taskHtml);

    $('#taskList li :last .progress').progressbar({
      label: task,
      value: 75,
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
  murdoch.initialize({ "applyChangesToReporting": [] });
});
