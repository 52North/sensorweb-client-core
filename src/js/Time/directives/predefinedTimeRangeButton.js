angular.module('n52.core.timeUi')
        .directive('swcPredefinedTimeRangeButton', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/time/predefined-time-range-button.html',
                controller: ['$scope', 'timeService',
                    function ($scope, timeService) {
                        $scope.newTimeExtent = function () {
                            timeService.setPresetInterval($scope.item.interval);
                        };
                    }]
            };
        });