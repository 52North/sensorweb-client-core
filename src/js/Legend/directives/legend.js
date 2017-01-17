angular.module('n52.core.legend')
        .directive('swcLegend', function () {
            return {
                restrict: 'E',
                templateUrl: 'n52.core.legend.legend',
                controller: ['$scope', 'timeseriesService',
                    function ($scope, timeseriesService) {
                        $scope.timeseriesList = timeseriesService.timeseries;
                    }]
            };
        });
