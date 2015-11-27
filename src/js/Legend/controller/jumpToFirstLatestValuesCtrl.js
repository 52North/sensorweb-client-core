angular.module('n52.core.legend')
        .controller('SwcJumpToFirstLatestValuesCtrl', ['$scope', 'timeService',
            function ($scope, timeService) {
                $scope.jumpToLastTimeStamp = function (lastValue) {
                    if (lastValue && lastValue.timestamp) {
                        timeService.jumpToLastTimeStamp(lastValue.timestamp, true);
                    }
                };
                $scope.jumpToFirstTimeStamp = function (firstValue) {
                    if (firstValue && firstValue.timestamp) {
                        timeService.jumpToLastTimeStamp(firstValue.timestamp, true);
                    }
                };
            }]);