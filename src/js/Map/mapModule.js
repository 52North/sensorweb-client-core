angular.module('n52.core.map', ['leaflet-directive', 'n52.core.interface', 'n52.core.status', 'n52.core.phenomena', 'n52.core.provider', 'n52.core.station', 'n52.core.listSelection', 'n52.core.locate'])
        .controller('BasicMapController', ['$scope', 'mapService', 'leafletData', '$log', '$translate', '$compile', '$rootScope',
            function ($scope, mapService, leafletData, $log, $translate, $compile, $rootScope) {
                $scope.map = mapService.map;

                // adds a leaflet geosearch
                $translate(['map.search.label', 'map.search.noResult']).then(function (translations) {
                    leafletData.getMap().then(function (map) {
                        new L.Control.GeoSearch({
                            url: 'http://nominatim.openstreetmap.org/search?format=json&q={s}',
                            jsonpParam: 'json_callback',
                            propertyName: 'display_name',
                            searchLabel: translations['map.search.label'],
                            notFoundMessage: translations['map.search.noResult'],
                            propertyLoc: ['lat', 'lon'],
                            position: 'topcenter',
                            minLength: 2,
                            showMarker: false,
                            provider: new L.GeoSearch.Provider.OpenStreetMap(),
                            zoomLevel: 13
                        }).addTo(map);
                    });
                });

                $rootScope.$on('resizeMap', function () {
                    leafletData.getMap().then(function (map) {
                        map.invalidateSize(false);
                    });
                });

                // add popup
                $scope.$watch('map.popup', function (newObj) {
                    if (angular.isDefined(newObj) && newObj.latlng) {
                        leafletData.getMap().then(function (map) {
                            var template = angular.element(newObj.content);
                            var linkFunction = $compile(template);
                            var newScope = $scope.$new();
                            angular.extend(newScope, newObj.scope);
                            var result = linkFunction(newScope)[0];
                            L.popup().setLatLng(newObj.latlng).setContent(result).openOn(map);
                        });
                    }
                }, true);
            }])
        .controller('SwcZoomControlsCtrl', ['$scope', 'mapService', function ($scope, mapService) {
                $scope.zoomIn = function () {
                    mapService.map.center.zoom = mapService.map.center.zoom + 1;
                };
                $scope.zoomOut = function () {
                    mapService.map.center.zoom = mapService.map.center.zoom - 1;
                };
            }])
        .controller('SwcMapLayerCtrl', ['$scope', function ($scope) {
                $scope.isToggled = false;
                $scope.openMenu = function () {
                    $scope.isToggled = true;
                };
                $scope.closeMenu = function () {
                    $scope.isToggled = false;
                };
            }])
        .controller('SwcBaseLayerCtrl', ['$scope', 'mapService', 'leafletData',
            function ($scope, mapService, leafletData) {
                leafletData.getMap().then(function (map) {
                    leafletData.getLayers().then(function (layers) {
                        angular.forEach(layers.baselayers, function (layer, key) {
                            if (map.hasLayer(layer)) {
                                mapService.map.layers.baselayers[key].visible = true;
                            }
                        });
                    });
                });
                $scope.baseLayers = mapService.map.layers.baselayers;
                $scope.switchVisibility = function (key) {
                    angular.forEach(mapService.map.layers.baselayers, function (layer, layerKey) {
                        if (layerKey === key) {
                            layer.visible = true;
                        } else {
                            layer.visible = false;
                        }
                    });
                    leafletData.getMap().then(function (map) {
                        leafletData.getLayers().then(function (layers) {
                            angular.forEach(layers.baselayers, function (layer) {
                                map.removeLayer(layer);
                            });
                            if (angular.isDefined(layers.baselayers[key])) {
                                map.addLayer(layers.baselayers[key]);
                            }
                        });
                    });
                };
            }])
        .controller('SwcOverlayCtrl', ['$scope', 'mapService', function ($scope, mapService) {
                $scope.baseLayers = mapService.map.layers.overlays;
                $scope.switchVisibility = function (layer) {
                    layer.visible = !layer.visible;
                };
            }])
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
                    if (statusService.status.concentrationMarker && phenomenon) {
                        params = {
                            service: statusService.status.apiProvider.serviceID,
                            phenomenon: phenomenon,
                            expanded: true,
                            force_latest_values: true,
                            status_intervals: true
                        };
                        interfaceService.getTimeseries(null, statusService.status.apiProvider.url, params).then(createMarkers);
                    } else {
                        params = {
                            service: statusService.status.apiProvider.serviceID,
                            phenomenon: phenomenon
                        };
                        interfaceService.getStations(null, statusService.status.apiProvider.url, params).then(createMarkers);
                    }
                };

                var createMarkers = function (data) {
                    angular.copy({}, map.markers);
                    angular.copy({}, map.paths);
                    angular.copy({}, map.bounds);
                    if (data.length > 0) {
                        var firstElemCoord = getCoordinates(data[0]);
                        var topmost = firstElemCoord[1];
                        var bottommost = firstElemCoord[1];
                        var leftmost = firstElemCoord[0];
                        var rightmost = firstElemCoord[0];
                        $.each(data, $.proxy(function (n, elem) {
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
                                    addColoredCircle(geom, elem);
                                } else {
                                    addNormalMarker(geom, elem);
                                }
                            }
                        }, this));
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

                var addNormalMarker = function (geom, elem) {
                    var marker = {
                        lat: geom[1],
                        lng: geom[0],
                        icon: stationMarkerIcon
                    };
                    if (statusService.status.clusterStations) {
                        marker.layer = 'cluster';
                    }
                    map.markers[elem.properties.id] = marker;
                };

                var addColoredCircle = function (geom, elem) {
                    var interval = getMatchingInterval(elem);
                    var fillcolor = interval && interval.color ? interval.color : settingsService.defaultMarkerColor;
                    map.paths[elem.station.properties.id] = {
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
                        fillOpacity: 0.8
                    };
                };

                var getMatchingInterval = function (elem) {
                    var matchedInterval = null;
                    if (elem.lastValue && elem.statusIntervals) {
                        var lastValue = elem.lastValue.value;
                        $.each(elem.statusIntervals, function (idx, interval) {
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