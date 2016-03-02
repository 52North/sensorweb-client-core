angular.module('n52.core.diagram')
        .controller('SwcTimeseriesCtrl', ['$scope', 'timeseriesService', function ($scope, timeseriesService) {
                $scope.timeseries = timeseriesService.timeseries;
                $scope.hasTimeseries = function () {
                    return Object.keys($scope.timeseries).length > 0;
                };
                $scope.hasVisibleTimeseries = function () {
                    var allHidden = true;
                    if ($scope.hasTimeseries()) {
                        allHidden = false;
                        angular.forEach($scope.timeseries, function (series) {
                            if (series.styles.visible)
                                allHidden = true;
                        });
                    }
                    return allHidden;
                };
            }]);