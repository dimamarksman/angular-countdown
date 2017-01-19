/*
 * Flip countdown.
 */
(function (angular) {
  'use strict';

  var defaultOptions = {
    days: true,
    hours: true,
    minutes: true,
    seconds: true,
    hideDaysIfEmpty: false
  };

  function countdownFlipTimer() {
    return {
      restrict: 'AE',
      templateUrl: 'src/components/countdownFlipTimer/countdown-flip-timer.tmpl.html',
      require: 'tkdCountdownModel',
      scope: {
        optsIn: '=tkdCountdownFlipTimerOptions'
      },
      link: function (scope, $element, attr, countdownModel) {
        var findElement = $element[0].querySelector.bind($element[0]),
          $days = angular.element(findElement('.days')),
          $hours = angular.element(findElement('.hours')),
          $minutes = angular.element(findElement('.minutes')),
          $seconds = angular.element(findElement('.seconds'));

        scope.options = angular.extend({}, defaultOptions);

        scope.$watch('optsIn', function (options) {
          if (options) {
            scope.options = angular.extend({}, defaultOptions, options);
          }
        });

        countdownModel.render = function render(range) {
          if (range.days >= 0) {
            move($days, range.days);
          }

          if (range.hours >= 0) {
            move($hours, range.hours);
          }

          if (range.minutes >= 0) {
            move($minutes, range.minutes);
          }

          if (range.seconds >= 0) {
            move($seconds, range.seconds);
          }
        };

        function move($ul, nextValue) {
          if ($ul.data('flipTimerValue') === nextValue) {
            return;
          }

          var $items = $ul.children(),
            $current = filterElements($items, function ($item) {
              return $item.hasClass('active');
            }),
            $next = filterElements($items, function ($item) {
              return !$item.hasClass('active');
            });

          angular.element($next[0].querySelectorAll('.inn')).text(nextValue);

          $items.removeClass('active').removeClass('before');

          $current.addClass('before').removeClass('active');

          $next.addClass('active');

          $ul.addClass('play');

          $ul.data('flipTimerValue', nextValue);
        }

        function filterElements($list, cb) {
          var filtered = [];
          for (var i = 0; i < $list.length; i++) {
            var $item = $list.eq(i);
            if ( cb($item) ) {
              filtered.push($list[i]);
            }
          }
          return angular.element(filtered);
        }
      }
    };
  }

  angular.module('tkdCountdown').directive('tkdCountdownFlipTimer', countdownFlipTimer);

})(window.angular);
