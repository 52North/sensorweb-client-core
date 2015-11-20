angular.module('n52.core.noDataWarning', ['n52.core.timeseries'])
        .controller('NoDataWarningCtrl', ['$scope', 'timeseriesService', function ($scope, timeseriesService) {
                $scope.timeseries = timeseriesService.timeseries;
            }])
        .filter('isNoDataVisible', function () {
            return function (timeseries) {
                if (Object.keys(timeseries).length > 0) {
                    var noDataVisible = false;
                    angular.forEach(timeseries, function (item) {
                        if (item.hasDataInCurrentExtent)
                            noDataVisible = true;
                    });
                    return noDataVisible;
                }
                return false;
            };
        });

        