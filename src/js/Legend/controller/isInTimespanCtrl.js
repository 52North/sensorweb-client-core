angular.module('n52.core.legend')
        .controller('SwcIsInTimespanCtrl', ['$scope', 'timeService',
            function ($scope, timeService) {
                $scope.time = timeService.time;
                $scope.isInTimeSpan = function (timestamp) {
                    return timeService.isInCurrentTimespan(timestamp);
                };
            }]);

    