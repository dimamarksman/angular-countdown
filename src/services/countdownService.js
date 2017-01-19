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
