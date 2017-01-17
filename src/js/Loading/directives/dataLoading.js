angular.module('n52.core.dataLoading')
        .directive('swcDataLoading', ['timeseriesService', function (timeseriesService) {
                return {
                    restrict: 'E',
                    templateUrl: 'n52.core.dataLoading.data-loading',
                    controller: ['$scope', function ($scope) {
                            $scope.timeseries = timeseriesService.timeseries;
                        }]
                };
            }]);
