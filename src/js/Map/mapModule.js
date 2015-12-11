angular.module('n52.core.map', [])
        .factory('mapService', ['$rootScope', 'leafletBoundsHelpers', 'interfaceService', 'statusService', 'settingsService', '$translate', '$http', '$location',
            function ($rootScope, leafletBoundsHelpers, interfaceService, statusService, settingsService, $translate, $http, $location) {
                var stationMarkerIcon = settingsService.stationIconOptions ? settingsService.stationIconOptions : {};
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
                var overlays = angular.extend(settingsService.overlays,
                        {
                            cluster: {
                                name: 'Stations',
                                type: 'markercluster',
                                visible: true,
                                layerOptions: {
                                    showOnSelector: false
                                }
                            }
                        });
                var map = {};
                var aggregateCounter;
                var aggregateBounds;

                var init = function () {
                    map.markers = {};
                    map.paths = {};
                    map.popup = {};
                    map.bounds = {};
                    map.center = {};
                    map.layers = {
                        baselayers: baselayer,
                        overlays: overlays
                    };

                    $rootScope.$on('allPhenomenaSelected', function (evt) {
                        map.selectedPhenomenonId = null;
                        requestStations();
                    });
                    $rootScope.$on('phenomenonSelected', function (evt, phenomenon) {
                        map.selectedPhenomenonId = phenomenon.id;
                        requestStations(phenomenon.id);
                    });
                    $rootScope.$on('redrawStations', function (evt, phenomenon) {
                        requestStations(map.selectedPhenomenonId);
                    });
                    $rootScope.$on('newProviderSelected', function (evt) {
                        requestStations();
                    });

                    requestStations();
                };

                var requestStations = function (phenomenon) {
                    var params;
                    if (settingsService.aggregateServicesInMap && angular.isUndefined(statusService.status.apiProvider.url)) {
                        requestAggregatedStations(phenomenon);
                    } else {
                        var provider = statusService.status.apiProvider;
                        if (statusService.status.concentrationMarker && phenomenon) {
                            params = {
                                service: provider.serviceID,
                                phenomenon: phenomenon,
                                expanded: true,
                                force_latest_values: true,
                                status_intervals: true
                            };
                            interfaceService.getTimeseries(null, provider.url, params).then(function (data) {
                                createMarkers(data, provider.url, provider.serviceID);
                            });
                        } else {
                            params = {
                                service: provider.serviceID,
                                phenomenon: phenomenon
                            };
                            interfaceService.getStations(provider.url, params).then(function (data) {
                                createMarkers(data, provider.url, provider.serviceID);
                            });
                        }
                    }
                };

                requestAggregatedStations = function (phenomenon) {
                    aggregateCounter = 0;
                    aggregateBounds = null;
                    angular.copy({}, map.markers);
                    angular.copy({}, map.paths);
                    angular.copy({}, map.bounds);
                    angular.forEach(settingsService.restApiUrls, function (id, url) {
                        interfaceService.getServices(url).then(function (providers) {
                            angular.forEach(providers, function (provider) {
                                aggregateCounter++;
                                interfaceService.getStations(url, {
                                    service: provider.id,
                                    phenomenon: phenomenon
                                }).then(function (data) {
                                    createAggregatedStations(data, url, provider.id + id);
                                });
                            });
                        });
                    });
                };

                var createAggregatedStations = function (data, serviceUrl, serviceId) {
                    aggregateCounter--;
                    if (data.length > 0) {
                        var firstElemCoord = getCoordinates(data[0]);
                        if (!angular.isObject(aggregateBounds)) {
                            aggregateBounds = {
                                topmost: firstElemCoord[1],
                                bottommost: firstElemCoord[1],
                                leftmost: firstElemCoord[0],
                                rightmost: firstElemCoord[0]
                            };
                        }
                        angular.forEach(data, function(elem) {
                            var geom = getCoordinates(elem);
                            if (!isNaN(geom[0]) || !isNaN(geom[1])) {
                                if (geom[0] > aggregateBounds.rightmost) {
                                    aggregateBounds.rightmost = geom[0];
                                }
                                if (geom[0] < aggregateBounds.leftmost) {
                                    aggregateBounds.leftmost = geom[0];
                                }
                                if (geom[1] > aggregateBounds.topmost) {
                                    aggregateBounds.topmost = geom[1];
                                }
                                if (geom[1] < aggregateBounds.bottommost) {
                                    aggregateBounds.bottommost = geom[1];
                                }
                                if (statusService.status.concentrationMarker && isTimeseries(elem)) {
                                    addColoredCircle(geom, elem);
                                } else {
                                    addNormalMarker(geom, elem, serviceUrl, serviceId);
                                }
                            }
                        });
                        angular.copy(leafletBoundsHelpers.createBoundsFromArray([
                            [parseFloat(aggregateBounds.bottommost), parseFloat(aggregateBounds.leftmost)],
                            [parseFloat(aggregateBounds.topmost), parseFloat(aggregateBounds.rightmost)]]), map.bounds);
                    }
                };

                var createMarkers = function (data, serviceUrl, serviceId) {
                    angular.copy({}, map.markers);
                    angular.copy({}, map.paths);
                    angular.copy({}, map.bounds);
                    if (data.length > 0) {
                        var firstElemCoord = getCoordinates(data[0]);
                        var topmost = firstElemCoord[1];
                        var bottommost = firstElemCoord[1];
                        var leftmost = firstElemCoord[0];
                        var rightmost = firstElemCoord[0];
                        angular.forEach(data, function(elem) {
                            var geom = getCoordinates(elem);
                            if (!isNaN(geom[0]) || !isNaN(geom[1])) {
                                if (geom[0] > rightmost) {
                                    rightmost = geom[0];
                                }
                                if (geom[0] < leftmost) {
                                    leftmost = geom[0];
                                }
                                if (geom[1] > topmost) {
                                    topmost = geom[1];
                                }
                                if (geom[1] < bottommost) {
                                    bottommost = geom[1];
                                }
                                if (statusService.status.concentrationMarker && isTimeseries(elem)) {
                                    addColoredCircle(geom, elem, serviceUrl, serviceId);
                                } else {
                                    addNormalMarker(geom, elem, serviceUrl, serviceId);
                                }
                            }
                        });
                        angular.copy(leafletBoundsHelpers.createBoundsFromArray([
                            [parseFloat(bottommost), parseFloat(leftmost)],
                            [parseFloat(topmost), parseFloat(rightmost)]]), map.bounds);
                    }
                };

                var isTimeseries = function (elem) {
                    return angular.isDefined(elem.station);
                };

                var getCoordinates = function (elem) {
                    if (elem.geometry && elem.geometry.coordinates) {
                        return elem.geometry.coordinates;
                    } else {
                        return elem.station.geometry.coordinates;
                    }
                };

                var addNormalMarker = function (geom, elem, serviceUrl, serviceId) {
                    var marker = {
                        lat: geom[1],
                        lng: geom[0],
                        icon: stationMarkerIcon,
                        station: elem,
                        url: serviceUrl
                    };
                    if (statusService.status.clusterStations) {
                        marker.layer = 'cluster';
                    }
                    map.markers[tidyUpStationId(elem.getId() + serviceId)] = marker;
                };

                var addColoredCircle = function (geom, elem, serviceUrl, serviceId) {
                    var interval = getMatchingInterval(elem);
                    var fillcolor = interval && interval.color ? interval.color : settingsService.defaultMarkerColor;
                    map.paths[tidyUpStationId(elem.station.getId() + serviceId)] = {
                        type: "circleMarker",
                        latlngs: {
                            lat: geom[1],
                            lng: geom[0]
                        },
                        color: '#000',
                        fillColor: fillcolor,
                        fill: true,
                        radius: 10,
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.8,
                        station: elem.station.getId(),
                        url: serviceUrl
                    };
                };

                var tidyUpStationId = function (id) {
                    return id.replace('-', '');
                };

                var getMatchingInterval = function (elem) {
                    var matchedInterval = null;
                    if (elem.lastValue && elem.statusIntervals) {
                        var lastValue = elem.lastValue.value;
                        angular.forEach(elem.statusIntervals, function (interval) {
                            if (interval.upper === null) {
                                interval.upper = Number.MAX_VALUE;
                            }
                            if (interval.lower === null) {
                                interval.lower = Number.MIN_VALUE;
                            }
                            if (!isNaN(interval.upper) && !isNaN(interval.lower) && parseFloat(interval.lower) < lastValue && lastValue < parseFloat(interval.upper)) {
                                matchedInterval = interval;
                                return false;
                            }
                        });
                    }
                    return matchedInterval;
                };

                var locateUser = function () {
                    map.center = {
                        autoDiscover: true,
                        zoom: 12
                    };
                    // wait for successfull user location
                    $rootScope.$on('leafletDirectiveMap.locationfound', function (evt, args) {
                        angular.copy({
                            content: '<p>' + $translate.instant('map.userLocation') + '</p>',
                            latlng: args.leafletEvent.latlng
                        }, map.popup);
                    });
                    $rootScope.$on('leafletDirectiveMap.locationerror', function (error) {
                        alert(error + error.message);
                    });
                };

                var showStation = function (timeseries) {
                    if (timeseries && timeseries.station) {
                        $http.get('templates/map/locateStation.html').success(function (content) {
                            map.popup = {
                                content: content,
                                scope: {
                                    timeseries: timeseries,
                                    backToDiagram: function () {
                                        $location.url('/diagram');
                                    }
                                },
                                latlng: {
                                    lat: timeseries.station.geometry.coordinates[1],
                                    lng: timeseries.station.geometry.coordinates[0]
                                }
                            };
                            map.center = {
                                lat: timeseries.station.geometry.coordinates[1],
                                lng: timeseries.station.geometry.coordinates[0],
                                zoom: 12
                            };
                        });
                    }
                };

                init();
                return {
                    map: map,
                    locateUser: locateUser,
                    showStation: showStation
                };
            }]);