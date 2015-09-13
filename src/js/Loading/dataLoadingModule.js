angular.module('dataLoadingModule', ['timeseriesModule'])
        .directive('swcDataLoading', ['timeseriesService', function (timeseriesService) {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/loading/data-loading.html',
                    controller: ['$scope', function ($scope) {
                            $scope.timeseries = timeseriesService.timeseries;
                        }]
                };
            }])
        .filter('isDataLoading', function () {
            return function (timeseries) {
                if (Object.keys(timeseries).length > 0) {
                    var loading = false;
                    angular.forEach(timeseries, function (item) {
                        if (item.loadingData)
                            loading = true;
                    });
                    return loading;
                }
                return false;
            };
        });

        