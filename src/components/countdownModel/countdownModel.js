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
