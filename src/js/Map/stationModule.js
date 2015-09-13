angular.module('stationModule', ['ui.bootstrap'])
        .controller('ModalStationCtrl', ['$scope', '$modalInstance', 'interfaceService', 'statusService', 'stationId', 'phenomenonId', 'timeseriesService', '$location',
            function ($scope, $modalInstance, interfaceService, statusService, stationId, phenomenonId, timeseriesService, $location) {
                $scope.isAllSelected = true;

                // load stations
                interfaceService.getStations(stationId, statusService.status.apiProvider.url).success(function (station, evt) {
                    // remove non matching phenomenonId
                    removeNonMatchingPhenoneons(station, phenomenonId);

                    $scope.station = station;
                    angular.forEach(station.properties.timeseries, function (timeseries, id) {
                        interfaceService.getTimeseries(id, statusService.status.apiProvider.url).then(function (ts) {
                            angular.extend(timeseries, ts);
                            timeseries.selected = true;
                        });
                    });
                });

                removeNonMatchingPhenoneons = function (station, phenomenonId) {
                    if (phenomenonId) {
                        var removableIds = [];
                        angular.forEach(station.properties.timeseries, function (timeseries, tsId) {
                            if (timeseries.phenomenon.id !== phenomenonId) {
                                removableIds.push(tsId);
                            }
                        });
                        angular.forEach(removableIds, function (id) {
                            delete station.properties.timeseries[id];
                        });
                    }
                };

                $scope.toggleAll = function () {
                    angular.forEach($scope.station.properties.timeseries, function (ts) {
                        ts.selected = $scope.isAllSelected;
                    });
                };

                $scope.toggled = function () {
                    var allSelected = true;
                    angular.forEach($scope.station.properties.timeseries, function (ts) {
                        if (!ts.selected)
                            allSelected = false;
                    });
                    $scope.isAllSelected = allSelected;
                };

                $scope.addTimeseriesSelection = function () {
                    angular.forEach($scope.station.properties.timeseries, function (timeseries) {
                        if (timeseries.selected) {
                            timeseriesService.addTimeseriesById(timeseries.id, statusService.status.apiProvider.url);
                        }
                    });
                    $location.url('/diagram');
                    $modalInstance.close();
                };
            }])
        .service('stationModalOpener', ['$modal',
            function ($modal) {
                return function (stationId, phenomenonId) {
                    $modal.open({
                        animation: true,
                        templateUrl: 'templates/map/station.html',
                        resolve: {
                            stationId: function () {
                                return stationId;
                            },
                            phenomenonId: function () {
                                return phenomenonId;
                            }
                        },
                        controller: 'ModalStationCtrl'
                    });
                };
            }]);