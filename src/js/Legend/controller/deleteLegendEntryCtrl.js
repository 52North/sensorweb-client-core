angular.module('n52.core.legend')
        .controller('SwcDeleteLegendEntryCtrl', ['$scope', 'timeseriesService',
            function ($scope, timeseriesService) {
                $scope.removeTs = function (ts) {
                    timeseriesService.removeTimeseries(ts.internalId);
                };
            }]);