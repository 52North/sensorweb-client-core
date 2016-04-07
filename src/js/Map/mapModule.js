angular.module('n52.core.map', [])
        .factory('mapService', ['$rootScope', 'leafletBoundsHelpers', 'interfaceService', 'statusService', 'settingsService', 'servicesHelper', '$injector',
            function ($rootScope, leafletBoundsHelpers, interfaceService, statusService, settingsService, servicesHelper, $injector) {
                var markerRenderer = ['statusIntervalMarkerRenderer', 'normalMarkerRenderer'];
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
                if (settingsService.showScale) {
                    map.controls = {
                        scale: true
                    };
                }
                var aggregateCounter;
                var aggregateBounds;

                var init = function () {
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

                    $rootScope.$on('allPhenomenaSelected', function (evt) {
                        map.selectedPhenomenon = null;
                        requestStations();
                    });
                    $rootScope.$on('phenomenonSelected', function (evt, phenomenon) {
                        map.selectedPhenomenon = phenomenon;
                        requestStations(phenomenon);
                    });
                    $rootScope.$on('redrawStations', function (evt, phenomenon) {
                        requestStations(map.selectedPhenomenon);
                    });
                    $rootScope.$on('newProviderSelected', function (evt) {
                        requestStations();
                    });

                    requestStations();
                };

                var requestStations = function (phenomenon) {
                    angular.copy({}, map.markers);
                    map.loading = true;
                    if (settingsService.aggregateServices && angular.isUndefined(statusService.status.apiProvider.url)) {
                        requestAggregatedStations(phenomenon);
                    } else {
                        if (statusService.status.concentrationMarker && phenomenon) {
                            angular.forEach(phenomenon.provider, function (provider) {
                                requestTimeseriesOfService(provider.serviceID, provider.url, createMarkers, provider.phenomenonID);
                            });
                        } else {
                            var provider;
                            if (phenomenon) {
                                angular.forEach(phenomenon.provider, function (entry) {
                                    requestStationsOfService(entry.serviceID, entry.url, createMarkers, entry.phenomenonID);
                                });
                            } else {
                                provider = statusService.status.apiProvider;
                                requestStationsOfService(provider.serviceID, provider.url, createMarkers);
                            }
                        }
                    }
                };

                var requestTimeseriesOfService = function (serviceID, url, callback, phenomenonID) {
                    var params = {
                        service: serviceID,
                        phenomenon: phenomenonID,
                        expanded: true,
                        force_latest_values: true,
                        status_intervals: true
                    };
                    interfaceService.getTimeseries(null, url, params).then(function (data) {
                        callback(data, url);
                    });
                };

                var requestStationsOfService = function (serviceID, url, callback, phenomenonID) {
                    var params = {
                        service: serviceID,
                        phenomenon: phenomenonID
                    };
                    interfaceService.getStations(null, url, params).then(function (data) {
                        callback(data, url);
                    });
                };

                var requestAggregatedStations = function (phenomenon) {
                    aggregateCounter = 0;
                    aggregateBounds = null;
                    angular.copy({}, map.paths);
                    angular.copy({}, map.bounds);
                    if (statusService.status.concentrationMarker && phenomenon) {
                        angular.forEach(phenomenon.provider, function (entry) {
                            aggregateCounter++;
                            requestTimeseriesOfService(entry.serviceID, entry.url, createAggregatedStations, entry.phenomenonID);
                        });
                    } else {
                        if (phenomenon) {
                            angular.forEach(phenomenon.provider, function (entry) {
                                aggregateCounter++;
                                requestStationsOfService(entry.serviceID, entry.url, createAggregatedStations, entry.phenomenonID);
                            });
                        } else {
                            servicesHelper.doForAllServices(function (provider, url) {
                                aggregateCounter++;
                                requestStationsOfService(provider.id, url, createAggregatedStations);
                            });
                        }
                    }
                };

                var createAggregatedStations = function (data, serviceUrl) {
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
                        angular.forEach(data, function (elem) {
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
                                var i = 0, addedMarker;
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
                        if (aggregateCounter === 0)
                            setBounds(aggregateBounds.bottommost, aggregateBounds.leftmost, aggregateBounds.topmost, aggregateBounds.rightmost);
                    }
                    if (aggregateCounter === 0)
                        map.loading = false;
                };

                var createMarkers = function (data, serviceUrl) {
                    angular.copy({}, map.paths);
                    angular.copy({}, map.bounds);
                    if (data.length > 0) {
                        var firstElemCoord = getCoordinates(data[0]);
                        var topmost = firstElemCoord[1];
                        var bottommost = firstElemCoord[1];
                        var leftmost = firstElemCoord[0];
                        var rightmost = firstElemCoord[0];
                        angular.forEach(data, function (elem) {
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
                                var i = 0, addedMarker;
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
                        setBounds(bottommost, leftmost, topmost, rightmost);
                    }
                    map.loading = false;
                };

                var setBounds = function (bottommost, leftmost, topmost, rightmost) {
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
                            [parseFloat(topmost), parseFloat(rightmost)]]), map.bounds);
                    }
                };

                var getCoordinates = function (elem) {
                    if (elem.geometry && elem.geometry.coordinates) {
                        return elem.geometry.coordinates;
                    } else {
                        return elem.station.geometry.coordinates;
                    }
                };

                init();
                return {
                    map: map
                };
            }])
        .service('stationService', ['interfaceService', 'settingsService',
            function (interfaceService, settingsService) {
                var preselectFirstTimeseries = angular.isUndefined(settingsService.preselectedFirstTimeseriesInStationView) ? false : settingsService.preselectedFirstTimeseriesInStationView === true;
                var selectFirst,
                        station = {
                            entry: {}
                        };
                determineTimeseries = function (stationId, url) {
                    selectFirst = preselectFirstTimeseries;
                    station.entry = {};
                    interfaceService.getStations(stationId, url).then(function (result) {
                        station.entry = result;
                        angular.forEach(result.properties.timeseries, function (timeseries, id) {
                            timeseries.selected = selectFirst || !preselectFirstTimeseries;
                            selectFirst = false;
                            interfaceService.getTimeseries(id, url).then(function (ts) {
                                angular.extend(timeseries, ts);
                            });
                        });
                    });
                };

                return {
                    determineTimeseries: determineTimeseries,
                    preselectFirstTimeseries: preselectFirstTimeseries,
                    station: station
                };
            }]);