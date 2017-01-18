angular.module('n52.core.listSelection')
        .controller('SwcValidateParameterConstellationCtrl', ['$scope', 'seriesApiInterface', 'statusService', 'timeseriesService',
            function ($scope, seriesApiInterface, statusService, timeseriesService) {
                $scope.isActive = false;
                $scope.validate = function(params) {
                    seriesApiInterface.getTimeseries(null, statusService.status.apiProvider.url, params).then(function (data) {
                        if (angular.isArray(data)) {
                            $scope.series = data[0];
                        } else {
                            $scope.series = data;
                        }
                        $scope.checkActive($scope.series);
                    });
                };
                $scope.toggleTs = function(series) {
                    if (!timeseriesService.hasTimeseries(series.internalId)) {
                        timeseriesService.addTimeseries(series);
                    } else {
                        timeseriesService.removeTimeseries(series.internalId);
                    }
                    $scope.checkActive(series);
                };
                $scope.checkActive = function(series) {
                    if (!timeseriesService.hasTimeseries(series.internalId)) {
                        $scope.isActive = false;
                    } else {
                        $scope.isActive = true;
                    }
                };
            }]);
