/*
 * tkdCountdown Module Definition
 */

(function (angular) {
  'use strict';

  angular.module('tkdCountdown', []);

})(window.angular);

/*
 * СountdownService
 */

(function (angular) {
  'use strict';

  function countdownService($window) {
    var service = $window.Object.create($window.EventEmitter.prototype),
      Math = $window.Math,
      timer,
      timerInterval = 1001,
      lastDate,
      countdownModelsTable = {};

    service.convertDateRangeStringToMs = convertDateRangeStringToMs;
    service.getTimeRangeAsObject = getTimeRangeAsObject;
    service.convertDateRangeStringToTimeRangeObj = convertDateRangeStringToTimeRangeObj;
    service.isTimeRangeStringElapsed = isTimeRangeStringElapsed;
    service.wrapTimeStr = wrapTimeStr;
    service.startCounter = startCounter;
    service.stopCounter = stopCounter;
    service.registerCountdownModel = registerCountdownModel;
    service.unregisterCountdownModel = unregisterCountdownModel;
    service.getCurrentTimeRangeByModelId = getCurrentTimeRangeByModelId;

    startCounter();

    return service;

    function convertDateRangeStringToMs(value) {
      var countdownTime = value.split(':').reverse(),
        ss = parseFloat(countdownTime[0]),
        mm = parseInt(countdownTime[1], 10),
        hh = parseInt(countdownTime[2], 10),
        dd = parseInt(countdownTime[3], 10),
        countdownRangeMs = 0;

      if (!isNaN(ss)) {
        countdownRangeMs += Math.floor(ss * 1000);
      }
      if (!isNaN(mm)) {
        countdownRangeMs += mm * 60 * 1000;
      }
      if (!isNaN(hh)) {
        countdownRangeMs += hh * 60 * 60 * 1000;
      }
      if (!isNaN(dd)) {
        countdownRangeMs += dd * 24 * 60 * 60 * 1000;
      }

      return countdownRangeMs;
    }

    function getTimeRangeAsObject(t) {
      var days,
        hours,
        minutes,
        seconds,
        milliseconds;

      days = Math.floor(t / 86400000);
      t -= days * 86400000;

      hours = Math.floor(t / 3600000) % 24;
      t -= hours * 3600000;

      minutes = Math.floor(t / 60000) % 60;
      t -= minutes * 60000;

      seconds = Math.floor(t / 1000) % 60;
      t -= seconds * 1000;

      milliseconds = Math.floor(t);

      return {
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds,
        milliseconds: milliseconds
      };
    }

    function convertDateRangeStringToTimeRangeObj(dateRangeString) {
      var timeMs = convertDateRangeStringToMs(dateRangeString);
      return getTimeRangeAsObject(timeMs);
    }

    function isTimeRangeStringElapsed(timeRangeString) {
      return (timeRangeString || '') === '' || timeRangeString === '00:00:00:00';
    }

    function wrapTimeStr(t) {
      return t < 10 ? '0' + t : t + '';
    }

    function startCounter() {
      stopCounter();
      lastDate = now();
      timer = $window.setInterval(tick, timerInterval);
    }

    function stopCounter() {
      $window.clearInterval(timer);
      timer = null;
    }

    function tick() {
      var date = now();
      service.trigger('tick', [{
        elapse: date - lastDate
      }]);
      lastDate = date;
    }

    function now() {
      return (new Date()).getTime();
    }

    function registerCountdownModel(modelId, model) {
      return countdownModelsTable[modelId] = model;
    }

    function unregisterCountdownModel(modelId) {
      return delete countdownModelsTable[modelId];
    }

    function getCurrentTimeRangeByModelId(modelId) {
      return countdownModelsTable[modelId] && countdownModelsTable[modelId].getCurrentTimeRange();
    }
  }

  countdownService.$inject = [
    '$window'
  ];

  angular.module('tkdCountdown').factory('tkdcountdownService', countdownService);

})(window.angular);

/*
 * CountdownModel directive.
 * Required to enable countdown logic.
 */

(function (angular) {
  'use strict';

  function CountdownModelCtrl($scope, $attrs, $parse, $log, $window, $timeout, tkdcountdownService) {
    var vm = this,
      timeRange = 0,
      onElapse = $parse($attrs.tkdOnElapse),
      modelIdSetter = $parse($attrs.tkdCountdownModelId).assign;

    vm.id = $window.Math.random().toString().slice(2);

    vm.timeRangeObj = tkdcountdownService.getTimeRangeAsObject(0);

    vm.render = function () {
      // It's called when the view needs to be updated. 
      // It's expected that the user of the countdown-model directive will implement this method.
    };

    vm.destroy = function () {
      stopCounter();
    };

    vm.getCurrentTimeRange = function () {
      return vm.timeRangeObj;
    };

    $scope.$watch($attrs.tkdCountdownModel, function (newValue) {
      if (newValue) {
        newValue = tkdcountdownService.convertDateRangeStringToMs(newValue);

        if (typeof newValue != 'number' || $window.isNaN(newValue)) {
          return $log.error('countdownTimer directive: parsing error.');
        }

        timeRange = newValue;

        stopCounter();

        startCounter();

        preRender(timeRange);
      }
    });

    $scope.$on('$destroy', function () {
      tkdcountdownService.unregisterCountdownModel(vm.id);
      vm.destroy();
    });

    // Expose model's id to parent scope
    if (modelIdSetter) {
      modelIdSetter($scope, vm.id);
    }

    // Register model in tkdcountdownService
    tkdcountdownService.registerCountdownModel(vm.id, vm);

    function startCounter() {
      tkdcountdownService.on('tick', tick);
    }

    function stopCounter() {
      tkdcountdownService.off('tick', tick);
    }

    function tick(event) {
      timeRange = Math.max(timeRange - event.elapse, 0);
      preRender(timeRange);
      if (timeRange === 0) {
        stopCounter();
        $timeout(function () {
          onElapse($scope);
        });
      }
    }

    function preRender(time) {
      vm.timeRangeObj = tkdcountdownService.getTimeRangeAsObject(time);
      vm.render(vm.timeRangeObj, time);
    }
  }

  CountdownModelCtrl.$inject = [
    '$scope',
    '$attrs',
    '$parse',
    '$log',
    '$window',
    '$timeout',
    'tkdcountdownService'
  ];

  function countdownModel() {
    return {
      restrict: 'A',
      controller: CountdownModelCtrl
    };
  }

  angular.module('tkdCountdown').directive('tkdCountdownModel', countdownModel);

})(window.angular);

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

angular.module("tkdCountdown").run(["$templateCache", function($templateCache) {$templateCache.put("src/components/countdownFlipTimer/countdown-flip-timer.tmpl.html","<div class=\"flip-timer\">	\r\n	<div class=\"flip-timer-item\" ng-show=\"options.days\">\r\n		<ul class=\"flip days\">\r\n	        <li class=\"active\">\r\n	            <a href=\"\">\r\n	                <div class=\"up\">\r\n	                    <div class=\"shadow\"></div>\r\n	                    <div class=\"inn\">0</div>\r\n	                </div>\r\n	                <div class=\"down\">\r\n	                    <div class=\"shadow\"></div>\r\n	                    <div class=\"inn\">0</div>\r\n	                </div>\r\n	            </a>\r\n	        </li>\r\n	        <li>\r\n	            <a href=\"\">\r\n	                <div class=\"up\">\r\n	                    <div class=\"shadow\"></div>\r\n	                    <div class=\"inn\">0</div>\r\n	                </div>\r\n	                <div class=\"down\">\r\n	                    <div class=\"shadow\"></div>\r\n	                    <div class=\"inn\">0</div>\r\n	                </div>\r\n	            </a>\r\n	        </li>\r\n	    </ul>\r\n	    <div class=\"flip-item-label\" translate=\"days\"></div>\r\n    </div>\r\n\r\n    <div class=\"flip-timer-item\" ng-show=\"options.hours\">\r\n		<ul class=\"flip hours\">\r\n	        <li class=\"active\">\r\n	            <a href=\"\">\r\n	                <div class=\"up\">\r\n	                    <div class=\"shadow\"></div>\r\n	                    <div class=\"inn\">0</div>\r\n	                </div>\r\n	                <div class=\"down\">\r\n	                    <div class=\"shadow\"></div>\r\n	                    <div class=\"inn\">0</div>\r\n	                </div>\r\n	            </a>\r\n	        </li>\r\n	        <li>\r\n	            <a href=\"\">\r\n	                <div class=\"up\">\r\n	                    <div class=\"shadow\"></div>\r\n	                    <div class=\"inn\">0</div>\r\n	                </div>\r\n	                <div class=\"down\">\r\n	                    <div class=\"shadow\"></div>\r\n	                    <div class=\"inn\">0</div>\r\n	                </div>\r\n	            </a>\r\n	        </li>\r\n	    </ul>\r\n	    <div class=\"flip-item-label\" translate=\"hours\"></div>\r\n    </div>\r\n\r\n    <div class=\"flip-timer-item\" ng-show=\"options.minutes\">\r\n		<ul class=\"flip minutes\">\r\n	        <li class=\"active\">\r\n	            <a href=\"\">\r\n	                <div class=\"up\">\r\n	                    <div class=\"shadow\"></div>\r\n	                    <div class=\"inn\">0</div>\r\n	                </div>\r\n	                <div class=\"down\">\r\n	                    <div class=\"shadow\"></div>\r\n	                    <div class=\"inn\">0</div>\r\n	                </div>\r\n	            </a>\r\n	        </li>\r\n	        <li>\r\n	            <a href=\"\">\r\n	                <div class=\"up\">\r\n	                    <div class=\"shadow\"></div>\r\n	                    <div class=\"inn\">0</div>\r\n	                </div>\r\n	                <div class=\"down\">\r\n	                    <div class=\"shadow\"></div>\r\n	                    <div class=\"inn\">0</div>\r\n	                </div>\r\n	            </a>\r\n	        </li>\r\n	    </ul>\r\n	    <div class=\"flip-item-label\" translate=\"minutes\"></div>\r\n    </div>\r\n\r\n	<div class=\"flip-timer-item\" ng-show=\"options.seconds\">\r\n	    <ul class=\"flip seconds\">\r\n	        <li class=\"active\">\r\n	            <a href=\"\">\r\n	                <div class=\"up\">\r\n	                    <div class=\"shadow\"></div>\r\n	                    <div class=\"inn\">0</div>\r\n	                </div>\r\n	                <div class=\"down\">\r\n	                    <div class=\"shadow\"></div>\r\n	                    <div class=\"inn\">0</div>\r\n	                </div>\r\n	            </a>\r\n	        </li>\r\n	        <li>\r\n	            <a href=\"\">\r\n	                <div class=\"up\">\r\n	                    <div class=\"shadow\"></div>\r\n	                    <div class=\"inn\">0</div>\r\n	                </div>\r\n	                <div class=\"down\">\r\n	                    <div class=\"shadow\"></div>\r\n	                    <div class=\"inn\">0</div>\r\n	                </div>\r\n	            </a>\r\n	        </li>\r\n	    </ul>\r\n	    <div class=\"flip-item-label\" translate=\"seconds\"></div>\r\n    </div>\r\n</div>");
$templateCache.put("src/components/countdownTimer/countdown-timer.tmpl.html","<div class=\"countdown-timer\">\r\n    <span class=\"item-label\" translate=\"Valid for\"></span> <span class=\"item-value\">DD:HH:MM:SS</span>\r\n</div>");}]);