angular.module('timeSelectorButtonsModule', ['timeModule', 'timeRangeModule'])
        .directive('swcTimeSelectorButtons', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/time/time-selector-buttons.html',
                controller: ['$scope', 'timeService',
                    function ($scope, timeService) {
                        $scope.time = timeService.time;

                        $scope.back = function () {
                            timeService.stepBack();
                        };

                        $scope.forward = function () {
                            timeService.stepForward();
                        };
                    }]
            };
        });