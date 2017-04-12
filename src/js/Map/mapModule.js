angular.module('n52.core.map', [])
    .factory('mapService', ['$rootScope', 'leafletBoundsHelpers', 'seriesApiInterface', 'statusService', 'settingsService', 'providerService', '$injector',
        function($rootScope, leafletBoundsHelpers, seriesApiInterface, statusService, settingsService, providerService, $injector) {
            var markerRenderer = ['statusIntervalMarkerRenderer', 'normalMarkerRenderer'];
            if (settingsService.markerRenderer)
                markerRenderer = settingsService.markerRenderer;
            var baselayer = settingsService.baselayer ? settingsService.baselayer : {
                osm: {
                    name: 'Open Street Map',
                    type: 'xyz',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    layerOptions: {
                        showOnSelector: true
                    }
                }
            };
            var overlays = angular.extend(settingsService.overlays, {
                cluster: {
                    name: 'Stations',
                    type: 'markercluster',
                    visible: true,
                    layerOptions: {
                        showOnSelector: false
                    }
                }
            });
            var map = {
                id: settingsService.stationMap ? settingsService.stationMap : 'stationMap'
            };
            if (settingsService.showScale) {
                map.controls = {
                    scale: true
                };
            }
            var requestCounter;
            var bounds;

            var init = function() {
                map.loading = false;
                map.markers = {};
                map.paths = {};
                map.popup = {};
                map.bounds = {};
                map.center = {};
                map.layers = {
                    baselayers: baselayer,
                    overlays: overlays
                };

                $rootScope.$on('allPhenomenaSelected', function() {
                    map.selectedPhenomenon = null;
                    requestStations();
                });
                $rootScope.$on('phenomenonSelected', function(evt, phenomenon) {
                    map.selectedPhenomenon = phenomenon;
                    requestStations(phenomenon);
                });
                $rootScope.$on('redrawStations', function() {
                    requestStations(map.selectedPhenomenon);
                });
                $rootScope.$on('newProviderSelected', function() {
                    requestStations();
                });

                requestStations();
            };

            var shouldRequestTimeseries = function() {
                var needsTimeseriesRequest = false;
                angular.forEach(markerRenderer, function(renderer) {
                    needsTimeseriesRequest = needsTimeseriesRequest || $injector.get(renderer).needsTimeseriesRequested();
                });
                return needsTimeseriesRequest;
            };

            var requestStations = function(phenomenon) {
                requestCounter = 0;
                bounds = null;
                angular.copy({}, map.markers);
                angular.copy({}, map.paths);
                map.loading = true;
                if (shouldRequestTimeseries() && phenomenon) {
                    angular.forEach(phenomenon.provider, function(provider) {
                        requestCounter++;
                        requestTimeseriesOfService(provider.serviceID, provider.url, createStation, provider.phenomenonID);
                    });
                } else if (phenomenon) {
                    angular.forEach(phenomenon.provider, function(entry) {
                        requestCounter++;
                        requestStationsOfService(entry.serviceID, entry.url, createStation, entry.phenomenonID);
                    });
                } else if (settingsService.aggregateServices && angular.isUndefined(statusService.status.apiProvider.url)) {
                    providerService.doForAllServices(function(provider, url) {
                        requestCounter++;
                        requestStationsOfService(provider.id, url, createStation);
                    });
                } else {
                    var provider = statusService.status.apiProvider;
                    requestCounter++;
                    requestStationsOfService(provider.serviceID, provider.url, createStation);
                }
            };

            var requestTimeseriesOfService = function(serviceID, url, callback, phenomenonID) {
                var params = {
                    service: serviceID,
                    phenomenon: phenomenonID,
                    expanded: true,
                    force_latest_values: true,
                    status_intervals: true
                };
                seriesApiInterface.getTimeseries(null, url, params).then(function(data) {
                    callback(data, url);
                });
            };

            var requestStationsOfService = function(serviceID, url, callback, phenomenonID) {
                var params = {
                    service: serviceID,
                    phenomenon: phenomenonID
                };
                seriesApiInterface.getStations(null, url, params).then(function(data) {
                    callback(data, url);
                });
            };

            var createStation = function(data, serviceUrl) {
                requestCounter--;
                if (data.length > 0) {
                    var firstElemCoord = getCoordinates(data[0]);
                    if (firstElemCoord) {

                        if (!angular.isObject(bounds)) {
                            bounds = {
                                topmost: firstElemCoord[1],
                                bottommost: firstElemCoord[1],
                                leftmost: firstElemCoord[0],
                                rightmost: firstElemCoord[0]
                            };
                        }
                        angular.forEach(data, function(elem) {
                            var geom = getCoordinates(elem);
                            if (!geom) {
                              console.error(elem.id + ' has no geometry');
                            } else if (!isNaN(geom[0]) || !isNaN(geom[1])) {
                                if (geom[0] > bounds.rightmost) {
                                    bounds.rightmost = geom[0];
                                }
                                if (geom[0] < bounds.leftmost) {
                                    bounds.leftmost = geom[0];
                                }
                                if (geom[1] > bounds.topmost) {
                                    bounds.topmost = geom[1];
                                }
                                if (geom[1] < bounds.bottommost) {
                                    bounds.bottommost = geom[1];
                                }
                                var i = 0,
                                    addedMarker;
                                do {
                                    addedMarker = $injector.get(markerRenderer[i]).addMarker({
                                        map: map,
                                        geometry: geom,
                                        element: elem,
                                        serviceUrl: serviceUrl
                                    });
                                    i++;
                                } while (!addedMarker);
                            }
                        });
                    } else {
                        console.log('Found stations in service ' + serviceUrl + ' which don\'t have coordinates to draw them on the map.');
                    }
                    if (requestCounter === 0)
                        setBounds(bounds.bottommost, bounds.leftmost, bounds.topmost, bounds.rightmost);
                }
                if (requestCounter === 0)
                    map.loading = false;
            };

            var setBounds = function(bottommost, leftmost, topmost, rightmost) {
                if (bottommost === topmost && leftmost === rightmost) {
                    var southWest = L.latLng(parseFloat(bottommost), parseFloat(leftmost)),
                        northEast = L.latLng(parseFloat(topmost), parseFloat(rightmost)),
                        bounds = L.latLngBounds(southWest, northEast),
                        center = bounds.getCenter();
                    angular.copy({
                        lat: center.lat,
                        lng: center.lng,
                        zoom: 12
                    }, map.center);
                } else {
                    angular.copy(leafletBoundsHelpers.createBoundsFromArray([
                        [parseFloat(bottommost), parseFloat(leftmost)],
                        [parseFloat(topmost), parseFloat(rightmost)]
                    ]), map.bounds);
                }
            };

            var getCoordinates = function(elem) {
                if (elem.geometry && elem.geometry.coordinates)
                    return elem.geometry.coordinates;
                if (elem.station && elem.station.geometry && elem.station.geometry.coordinates)
                    return elem.station.geometry.coordinates;
                return null;
            };

            init();
            return {
                map: map
            };
        }
    ])
    .service('stationService', ['seriesApiInterface', 'settingsService',
        function(seriesApiInterface, settingsService) {
            var preselectFirstTimeseries = angular.isUndefined(settingsService.preselectedFirstTimeseriesInStationView) ? false : settingsService.preselectedFirstTimeseriesInStationView === true;
            var selectFirst,
                station = {
                    entry: {}
                };
            var determineTimeseries = function(stationId, url) {
                selectFirst = preselectFirstTimeseries;
                station.entry = {};
                seriesApiInterface.getStations(stationId, url).then(function(result) {
                    station.entry = result;
                    angular.forEach(result.properties.timeseries, function(timeseries) {
                        timeseries.selected = selectFirst || !preselectFirstTimeseries;
                        selectFirst = false;
                    });
                });
            };

            return {
                determineTimeseries: determineTimeseries,
                preselectFirstTimeseries: preselectFirstTimeseries,
                station: station
            };
        }
    ]);
