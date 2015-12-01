angular.module('n52.core.listSelection')
        .controller('SwcValidateParameterConstellationCtrl', ['$scope', 'interfaceService', 'statusService', 'timeseriesService',
            function ($scope, interfaceService, statusService, timeseriesService) {
                var timeseries;
                $scope.isActive = false;
                $scope.validate = function(params) {
                    interfaceService.getTimeseries(null, statusService.status.apiProvider.url, params).then(function (data) {
                        if (angular.isArray(data)) {
                            timeseries = data[0];
                        } else {
                            timeseries = data;
                        }
                        checkActive();
                    });
                };
                $scope.toggleTs = function() {
                    if (!timeseriesService.hasTimeseries(timeseries.internalId)) {
                        timeseriesService.addTimeseries(timeseries);
                    } else {
                        timeseriesService.removeTimeseries(timeseries.internalId);
                    }
                    checkActive();
                };
                checkActive = function() {
                    if (!timeseriesService.hasTimeseries(timeseries.internalId)) {
                        $scope.isActive = false;
                    } else {
                        $scope.isActive = true;
                    }
                };
            }]);
