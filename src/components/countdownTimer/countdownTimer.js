(function (angular) {
  'use strict';

  function countdownTimer() {
    return {
      restrict: 'AE',
      templateUrl: 'app/countdown/components/countdownTimer/countdown-timer.tmpl.html',
      require: 'countdownModel',
      link: function (scope, element, attr, countdownModel) {
        var $counterEl = element.find('.item-value'),
          DAY = 'day',
          DAYS = 'days',
          HOUR = 'hour',
          HOURS = 'hours',
          MINUTE = 'minute',
          MINUTES = 'minutes',
          SECOND = 'second',
          SECONDS = 'seconds';

        countdownModel.render = function render(range) {
          var str = '';

          if (range.days > 0) {
            str += range.days + ' ' + (range.days > 1 ? DAYS : DAY);
          }

          if (str.length > 0 || range.hours > 0) {
            str += (str.length ? ' ' : '') + range.hours + ' ' + (range.hours > 1 ? HOURS : HOUR);
          }

          if (str.length > 0 || range.minutes > 0) {
            str += (str.length ? ' ' : '') + range.minutes + ' ' + (range.minutes > 1 ? MINUTES : MINUTE);
          }

          if (str.length > 0 || range.seconds > 0) {
            str += (str.length ? ' ' : '') + range.seconds + ' ' + (range.seconds > 1 ? SECONDS : SECOND);
          }

          $counterEl.html(str);
        };
      }
    };
  }

  angular.module('countdown').directive('countdownTimer', countdownTimer);

})(window.angular);
