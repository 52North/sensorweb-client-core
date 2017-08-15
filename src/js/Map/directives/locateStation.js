angular.module('n52.core.map')
    .service('locateStationService', ['$injector', '$rootScope', 'settingsService', 'seriesApiInterface',
        function($injector, $rootScope, settingsService, seriesApiInterface) {

            var createCloseEvents = function(map) {
                var popupClosed = $rootScope.$on('leafletDirectiveMap.' + map.id + '.popupclose', function() {
                    popupClosed();
                    mapClosed();
                    delete map.markers.selectedStation;
                });
                var mapClosed = $rootScope.$on('leafletDirectiveMap.' + map.id + '.unload', function() {
                    popupClosed();
                    mapClosed();
                    delete map.markers.selectedStation;
                });
            };

            var centerMap = function(map, coordinates) {
                map.center = {
                    lat: coordinates[1],
                    lng: coordinates[0],
                    zoom: 12
                };
            };

            var setSelection = function(map, selection) {
                map.markers.selectedStation = selection;
            };

            this.showStation = function(mapService, timeseries) {
                var service = $injector.get(mapService);
                var map = service.map;
                if (timeseries && timeseries.station) {
                    var selectedStation = {
                        lat: timeseries.station.geometry.coordinates[1],
                        lng: timeseries.station.geometry.coordinates[0],
                        focus: true,
                        clickable: false,
                        icon: settingsService.stationIconOptions,
                        message: '<swc-locate-station timeseriesid="' + timeseries.internalId + '"></swc-locate-station>'
                    };
                    setSelection(map, selectedStation);
                    centerMap(map, timeseries.station.geometry.coordinates);
                    createCloseEvents(map);
                }
            };
            this.showPlatform = function(mapService, dataset) {
                var service = $injector.get(mapService);
                var map = service.map;
                var platformId;
                if (dataset && dataset.seriesParameters) platformId = dataset.seriesParameters.platform.id;
                if (dataset && dataset.datasetParameters) platformId = dataset.datasetParameters.platform.id;
                seriesApiInterface.getPlatforms(platformId, dataset.apiUrl)
                    .then((platform) => {
                        var selectedPlatform = {
                            lat: platform.geometry.coordinates[1],
                            lng: platform.geometry.coordinates[0],
                            focus: true,
                            clickable: false,
                            icon: settingsService.stationIconOptions,
                            message: '<swc-locate-station timeseriesid="' + dataset.internalId + '"></swc-locate-station>'
                        };
                        setSelection(map, selectedPlatform);
                        centerMap(map, platform.geometry.coordinates);
                        createCloseEvents(map);
                    });
            };
        }
    ])
    .directive('swcLocateStation', ['timeseriesService',
        function(timeseriesService) {
            return {
                restrict: 'E',
                templateUrl: 'n52.core.map.locate-station',
                scope: {},
                link: function(scope, element, attrs) {
                    scope.timeseries = timeseriesService.getTimeseries(attrs.timeseriesid);
                }
            };
        }
    ]);
