(function (angular) {
  'use strict';

  function CountdownModelCtrl($scope, $attrs, $parse, $log, $window, $timeout, countdownService) {
    var vm = this,
      timeRange = 0,
      onElapse = $parse($attrs.onElapse),
      modelIdSetter = $parse($attrs.countdownModelId).assign;

    vm.id = $window.Math.random().toString().slice(2);

    vm.timeRangeObj = countdownService.getTimeRangeAsObject(0);

    // Called when the view needs to be updated. 
    // It is expected that the user of the countdown-model
    // directive will implement this method.
    vm.render = function () {};

    vm.destroy = function () {
      stopCounter();
    };

    vm.getCurrentTimeRange = function () {
      return vm.timeRangeObj;
    };

    $scope.$watch($attrs.countdownModel, function (newValue) {
      if (newValue) {
        newValue = countdownService.convertDateRangeStringToMs(newValue);

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
      countdownService.unregisterCountdownModel(vm.id);
      vm.destroy();
    });

    // Expose model's id to parent scope
    if (modelIdSetter) {
      modelIdSetter($scope, vm.id);
    }

    // Register model in countdownService
    countdownService.registerCountdownModel(vm.id, vm);

    function startCounter() {
      countdownService.on('tick', tick);
    }

    function stopCounter() {
      countdownService.off('tick', tick);
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
      vm.timeRangeObj = countdownService.getTimeRangeAsObject(time);
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
    'countdownService'
  ];

  function countdownModel() {
    return {
      restrict: 'A',
      controller: CountdownModelCtrl
    };
  }

  angular.module('tkdCountdown').directive('tkdCountdownModel', countdownModel);

})(window.angular);