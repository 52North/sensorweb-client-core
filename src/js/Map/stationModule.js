angular.module('n52.core.station', ['ui.bootstrap'])
        .controller('ModalStationCtrl', ['$scope', '$modalInstance', 'statusService', 'timeseriesService', '$location', 'stationService', 'stationId', 'phenomenonId',
            function ($scope, $modalInstance, statusService, timeseriesService, $location, stationService, stationId, phenomenonId) {
                stationService.determineTimeseries(stationId);
                $scope.isAllSelected = true;
                $scope.station = stationService.station;
                $scope.phenomenonId = phenomenonId;

                $scope.toggleAll = function () {
                    angular.forEach($scope.station.entry.properties.timeseries, function (ts) {
                        ts.selected = $scope.isAllSelected;
                    });
                };

                $scope.close = function () {
                    $modalInstance.close();
                };

                $scope.toggled = function () {
                    var allSelected = true;
                    angular.forEach($scope.station.entry.properties.timeseries, function (ts) {
                        if (!ts.selected)
                            allSelected = false;
                    });
                    $scope.isAllSelected = allSelected;
                };

                $scope.addTimeseriesSelection = function () {
                    angular.forEach($scope.station.entry.properties.timeseries, function (timeseries) {
                        if (timeseries.selected) {
                            timeseriesService.addTimeseriesById(timeseries.id, statusService.status.apiProvider.url);
                        }
                    });
                    $location.url('/diagram');
                    $modalInstance.close();
                };
            }])
        .controller('StationOpenerCtrl', ['$modal', '$rootScope', 'mapService',
            function ($modal, $rootScope, mapService) {
                $rootScope.$on('leafletDirectiveMarker.click', function (event, args) {
                    var stationId = args.modelName;
                    $modal.open({
                        animation: true,
                        templateUrl: 'templates/map/station.html',
                        resolve: {
                            stationId: function () {
                                return stationId;
                            },
                            phenomenonId: function () {
                                return mapService.map.selectedPhenomenonId;
                            }
                        },
                        controller: 'ModalStationCtrl'
                    });
                });
            }])
        .service('stationService', ['interfaceService', 'statusService',
            function (interfaceService, statusService) {
                var station = {
                    entry: {}
                };
                determineTimeseries = function (stationId) {
                    station.entry = {};
                    interfaceService.getStations(stationId, statusService.status.apiProvider.url).success(function (result, evt) {
                        station.entry = result;
                        angular.forEach(result.properties.timeseries, function (timeseries, id) {
                            interfaceService.getTimeseries(id, statusService.status.apiProvider.url).then(function (ts) {
                                angular.extend(timeseries, ts);
                                timeseries.selected = true;
                            });
                        });
                    });
                };

                return {
                    determineTimeseries: determineTimeseries,
                    station: station
                };
            }]);