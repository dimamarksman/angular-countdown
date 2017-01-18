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
			link: function (scope, element, attr, countdownModel) {
				var $days = element.find('.days'),
					$hours = element.find('.hours'),
					$minutes = element.find('.minutes'),
					$seconds = element.find('.seconds');

				scope.options = angular.extend({}, defaultOptions);

				scope.$watch('optsIn', function(options) {
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
						$current = $items.filter('.active'),
						$next = $items.not('.active');

					$next.find('.inn').text(nextValue);
					
					$items.removeClass('active').removeClass('before');
					
					$current.addClass('before').removeClass('active');
					
					$next.addClass('active');
					
					$ul.addClass('play');
					
					$ul.data('flipTimerValue', nextValue);
				}
			}
		};
	}

	angular.module('tkdCountdown').directive('tkdCountdownFlipTimer', countdownFlipTimer);

})(window.angular);