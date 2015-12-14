angular.module('n52.core.map')
        .controller('SwcModalStationCtrl', ['$scope', '$uibModalInstance', 'timeseriesService', '$location', 'stationService', 'selection',
            function ($scope, $uibModalInstance, timeseriesService, $location, stationService, selection) {
                stationService.determineTimeseries(selection.stationId, selection.url);
                $scope.isAllSelected = true;
                $scope.station = stationService.station;
                $scope.phenomenonId = selection.phenomenonId;

                $scope.toggleAll = function () {
                    angular.forEach($scope.station.entry.properties.timeseries, function (ts) {
                        ts.selected = $scope.isAllSelected;
                    });
                };

                $scope.close = function () {
                    $uibModalInstance.close();
                };

                $scope.toggled = function () {
                    var allSelected = true;
                    angular.forEach($scope.station.entry.properties.timeseries, function (ts) {
                        if (!ts.selected)
                            allSelected = false;
                    });
                    $scope.isAllSelected = allSelected;
                };

                $scope.addTimeseriesSelection = function (phenomenonId) {
                    angular.forEach($scope.station.entry.properties.timeseries, function (timeseries) {
                        if (timeseries.selected && (!phenomenonId || timeseries.phenomenon.id === phenomenonId)) {
                            timeseriesService.addTimeseriesById(timeseries.id, selection.url);
                        }
                    });
                    $location.url('/diagram');
                    $uibModalInstance.close();
                };
            }]);