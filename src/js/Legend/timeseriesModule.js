angular.module('n52.core.timeseriesController', ['n52.core.timeseries', 'n52.core.exportTs', 'n52.core.style'])
        .controller('deleteAllTsCtrl', ['$scope', 'timeseriesService',
            function ($scope, timeseriesService) {
                $scope.deleteAll = function () {
                    timeseriesService.removeAllTimeseries();
                };
            }])
        .controller('IsInTimespanCtrl', ['$scope', 'timeService',
            function ($scope, timeService) {
                $scope.time = timeService.time;
                $scope.isInTimeSpan = function (timestamp) {
                    return timeService.isInCurrentTimespan(timestamp);
                };
            }]);

    