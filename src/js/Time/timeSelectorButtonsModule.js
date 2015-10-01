angular.module('n52.core.timeSelectorButtons', ['n52.core.time', 'n52.core.timeRange'])
        .directive('swcTimeSelectorButtons', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/time/time-selector-buttons.html',
                controller: 'TimeSelectorCtrl'
            };
        })
        .controller('TimeSelectorCtrl', ['$scope', 'timeService',
            function ($scope, timeService) {
                $scope.time = timeService.time;

                $scope.back = function () {
                    timeService.stepBack();
                };

                $scope.forward = function () {
                    timeService.stepForward();
                };
            }]);
                