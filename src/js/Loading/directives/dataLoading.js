angular.module('n52.core.dataLoading')
        .directive('swcDataLoading', ['timeseriesService', function (timeseriesService) {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/loading/data-loading.html',
                    controller: ['$scope', function ($scope) {
                            $scope.timeseries = timeseriesService.timeseries;
                        }]
                };
            }]);