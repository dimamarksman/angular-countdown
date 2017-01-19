/*
* Simple countdown.
*/
(function (angular) {
  'use strict';

  function countdownTimer() {
    return {
      restrict: 'AE',
      templateUrl: 'src/components/countdownTimer/countdown-timer.tmpl.html',
      require: 'tkdCountdownModel',
      link: function (scope, $element, attr, countdownModel) {
        var $counterEl = angular.element($element[0].querySelector('.item-value')),
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

  angular.module('tkdCountdown').directive('tkdCountdownTimer', countdownTimer);

})(window.angular);
