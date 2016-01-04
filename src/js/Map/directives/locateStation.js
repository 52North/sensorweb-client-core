angular.module('n52.core.map')
        .service('locateStationService', ['$injector', '$rootScope', 'settingsService',
            function ($injector, $rootScope, settingsService) {
                this.showStation = function (mapId, mapService, timeseries) {
                    var service = $injector.get(mapService);
                    var map = service.map;
                    if (timeseries && timeseries.station) {
                        var selectedStation = {
                            lat: timeseries.station.geometry.coordinates[1],
                            lng: timeseries.station.geometry.coordinates[0],
                            focus: true,
                            clickable: false,
                            icon: settingsService.stationIconOptions,
                            message: "<swc-locate-station timeseriesid='" + timeseries.internalId + "'></swc-locate-station>"
                        };
                        map.markers.selectedStation = selectedStation;
                        map.center = {
                            lat: timeseries.station.geometry.coordinates[1],
                            lng: timeseries.station.geometry.coordinates[0],
                            zoom: 12
                        };
                        var popupClosed = $rootScope.$on('leafletDirectiveMap.' + mapId + '.popupclose', function () {
                            popupClosed();
                            mapClosed();
                            delete map.markers.selectedStation;
                        });
                        var mapClosed = $rootScope.$on('leafletDirectiveMap.' + mapId + '.unload', function () {
                            popupClosed();
                            mapClosed();
                            delete map.markers.selectedStation;
                        });
                    }
                };
            }])
        .directive('swcLocateStation', ['timeseriesService',
            function (timeseriesService) {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/map/locateStation.html',
                    scope: {},
                    link: function (scope, element, attrs) {
                        scope.timeseries = timeseriesService.getTimeseries(attrs.timeseriesid);
                    }
                };
            }]);