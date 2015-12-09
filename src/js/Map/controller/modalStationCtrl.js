angular.module('n52.core.station', [])
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
            }])
        .service('StationOpener', ['$uibModal', '$rootScope', 'mapService',
            function ($uibModal, $rootScope, mapService) {
                clickmarker = function (event, args) {
                    $uibModal.open({
                        animation: true,
                        templateUrl: 'templates/map/station.html',
                        resolve: {
                            selection: function () {
                                var stationsId;
                                var url;
                                if (args.model) {
                                    stationsId = args.model.stationsId ? args.model.stationsId : "";
                                    url = args.model.url ? args.model.url : "";
                                } else if (args.leafletObject && args.leafletObject.options) {
                                    stationsId = args.leafletObject.options.stationsId ? args.leafletObject.options.stationsId : "";
                                    url = args.leafletObject.options.url ? args.leafletObject.options.url : "";
                                }
                                return {
                                    stationId: stationsId,
                                    phenomenonId: mapService.map.selectedPhenomenonId,
                                    url: url
                                };
                            }
                        },
                        controller: 'SwcModalStationCtrl'
                    });
                };
                $rootScope.$on('leafletDirectivePath.click', clickmarker);
                $rootScope.$on('leafletDirectiveMarker.click', clickmarker);
            }])
        .service('stationService', ['interfaceService',
            function (interfaceService) {
                var station = {
                    entry: {}
                };
                determineTimeseries = function (stationId, url) {
                    station.entry = {};
                    interfaceService.getStations(stationId, url).then(function (result) {
                        station.entry = result;
                        angular.forEach(result.properties.timeseries, function (timeseries, id) {
                            interfaceService.getTimeseries(id, url).then(function (ts) {
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