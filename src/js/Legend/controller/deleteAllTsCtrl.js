angular.module('n52.core.legend')
        .controller('SwcDeleteAllTsCtrl', ['$scope', 'timeseriesService',
            function ($scope, timeseriesService) {
                $scope.deleteAll = function () {
                    timeseriesService.removeAllTimeseries();
                };
            }]);    