angular.module('n52.core.timeUi')
        .directive('swcPredefinedTimeRangeButton', function () {
            return {
                restrict: 'E',
                templateUrl: 'n52.core.timeUi.predefined-time-range-button',
                controller: ['$scope', 'timeService',
                    function ($scope, timeService) {
                        $scope.newTimeExtent = function () {
                            timeService.setPresetInterval($scope.item.interval);
                        };
                    }]
            };
        });
