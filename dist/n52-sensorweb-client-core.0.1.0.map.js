angular.module('listSelectionModule', ['interfaceModule', 'statusModule'])
        .controller('ListSelectionButtonCtrl', ['$scope', '$modal',
            function ($scope, $modal) {
                $scope.openListSelection = function () {
                    $modal.open({
                        animation: true,
                        templateUrl: 'templates/listSelection/modal-list-selection.html',
                        controller: 'ModalListSelectionCtrl'
                    });
                };
            }])
        .controller('ModalListSelectionCtrl', ['$scope', '$modalInstance',
            function ($scope, $modalInstance) {
                $scope.modalInstance = $modalInstance;

                $scope.categoryParams = [
                    {
                        type: 'category',
                        header: 'listSelection.headers.category'
                    },
                    {
                        type: 'feature',
                        header: 'listSelection.headers.station'
                    },
                    {
                        type: 'phenomenon',
                        header: 'listSelection.headers.phenomenon'
                    },
                    {
                        type: 'procedure',
                        header: 'listSelection.headers.procedure'
                    }
                ];

                $scope.stationParams = [
                    {
                        type: 'feature',
                        header: 'listSelection.headers.station'
                    },
                    {
                        type: 'category',
                        header: 'listSelection.headers.category'
                    },
                    {
                        type: 'phenomenon',
                        header: 'listSelection.headers.phenomenon'
                    },
                    {
                        type: 'procedure',
                        header: 'listSelection.headers.procedure'
                    }
                ];

                $scope.phenomenonParams = [
                    {
                        type: 'phenomenon',
                        header: 'listSelection.headers.phenomenon'
                    },
                    {
                        type: 'category',
                        header: 'listSelection.headers.category'
                    },
                    {
                        type: 'feature',
                        header: 'listSelection.headers.station'
                    },
                    {
                        type: 'procedure',
                        header: 'listSelection.headers.procedure'
                    }
                ];

                $scope.close = function () {
                    $modalInstance.close();
                };
            }])
        .directive('swcListSelection', ['interfaceService', 'statusService', 'timeseriesService', '$location',
            function (interfaceService, statusService, timeseriesService, $location) {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/listSelection/accordion-list-selection.html',
                    scope: {
                        parameters: '='
                    },
                    controller: ['$scope', function ($scope) {
                        angular.forEach($scope.parameters, function (param, openedIdx) {
                            $scope.$watch('parameters[' + openedIdx + '].isOpen', function (newVal, oldVal) {
                                if (newVal) {
                                    $scope.selectedParameterIndex = openedIdx;
                                    // TODO nachfolger disablen und zurücksetzen
                                    angular.forEach($scope.parameters, function (param, idx) {
                                        if (idx > openedIdx) {
                                            param.isDisabled = true;
                                            delete param.selectedId;
                                            delete param.items;
                                        }
                                        if (idx >= openedIdx) {
                                            delete param.headerAddition;
                                        }
                                    });
                                }
                            });
                        });

                        $scope.createParams = function () {
                            var params = {
                                service: statusService.status.apiProvider.serviceID
                            };
                            angular.forEach($scope.parameters, function (parameter) {
                                if (parameter.selectedId) {
                                    params[parameter.type] = parameter.selectedId;
                                }
                            });
                            return params;
                        };

                        $scope.getItems = function (currParam) {
                            if (currParam.type === 'category') {
                                interfaceService.getCategories(null, statusService.status.apiProvider.url, $scope.createParams()).success(function (data) {
                                    currParam.items = data;
                                });
                            } else if (currParam.type === 'feature') {
                                interfaceService.getFeatures(null, statusService.status.apiProvider.url, $scope.createParams()).success(function (data) {
                                    currParam.items = data;
                                });
                            } else if (currParam.type === 'phenomenon') {
                                interfaceService.getPhenomena(null, statusService.status.apiProvider.url, $scope.createParams()).success(function (data) {
                                    currParam.items = data;
                                });
                            } else if (currParam.type === 'procedure') {
                                interfaceService.getProcedures(null, statusService.status.apiProvider.url, $scope.createParams()).success(function (data) {
                                    currParam.items = data;
                                });
                            }
                        };

                        $scope.openNext = function (idx) {
                            $scope.parameters[idx].isDisabled = false;
                            $scope.selectedParameterIndex = idx;
                            $scope.parameters[idx].isOpen = true;
                            $scope.getItems($scope.parameters[idx]);
                        };

                        $scope.openItem = function (item) {
                            $scope.parameters[$scope.selectedParameterIndex].selectedId = item.id;
                            $scope.parameters[$scope.selectedParameterIndex].headerAddition = item.label;
                            if ($scope.selectedParameterIndex < $scope.parameters.length - 1) {
                                $scope.openNext($scope.selectedParameterIndex + 1);
                            } else {
                                timeseriesService.addTimeseriesById(null, statusService.status.apiProvider.url, $scope.createParams());
                                $location.url('/diagram');
                                $scope.$parent.modalInstance.close();
                            }
                        };

                        $scope.openNext(0);
                    }]
                };
            }]);

angular.module('locateModule', ['stationModule'])
        .controller('LocateButtonCtrl', ['$scope', 'mapService', function ($scope, mapService) {
                $scope.locateUser = function () {
                    mapService.locateUser();
                };
            }]);
angular.module('mapModule', ['leaflet-directive', 'interfaceModule', 'statusModule', 'phenomenaModule', 'providerModule', 'stationModule', 'listSelectionModule', 'locateModule'])
        .controller('BasicMapController', ['$scope', 'mapService', 'leafletData', '$log', '$translate', 'stationModalOpener', '$compile',
            function ($scope, mapService, leafletData, $log, $translate, stationModalOpener, $compile) {
                $log.info('start mapController');
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

                var clickEvent = function (event, args) {
                    var stationId = args.modelName;
                    stationModalOpener(stationId, $scope.map.selectedPhenomenonId);
                };

                $scope.$on('leafletDirectiveMarker.click', clickEvent);
                $scope.$on('leafletDirectivePath.click', clickEvent);

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
        .factory('mapService', ['$rootScope', 'leafletBoundsHelpers', 'interfaceService', 'statusService', 'settingsService', '$translate', '$http', '$location',
            function ($rootScope, leafletBoundsHelpers, interfaceService, statusService, settingsService, $translate, $http, $location) {
                var map = {};

                var init = function () {
                    map.markers = {};
                    map.paths = {};
                    map.popup = {};
                    map.bounds = {};
                    map.center = {};
                    map.layers = {
                        baselayers: {
                            osm: {
                                name: 'OpenStreetMap',
                                type: 'xyz',
                                url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                                layerOptions: {
                                    showOnSelector: false
                                }
                            }
                        },
                        overlays: {
                            cluster: {
                                name: 'stations',
                                type: 'markercluster',
                                visible: true,
                                layerOptions: {
                                    showOnSelector: false
                                }
                            }
                        }
                    };

                    $rootScope.$on('allPhenomenaSelected', function (evt) {
                        map.selectedPhenomenonId = null;
                        requestStations();
                    });
                    $rootScope.$on('phenomenonSelected', function (evt, phenomenon) {
                        map.selectedPhenomenonId = phenomenon.id;
                        requestStations(phenomenon.id);
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
                        interfaceService.getTimeseries(null, statusService.status.apiProvider.url, params).success(createMarkers);
                    } else {
                        params = {
                            service: statusService.status.apiProvider.serviceID,
                            phenomenon: phenomenon
                        };
                        interfaceService.getStations(null, statusService.status.apiProvider.url, params).success(createMarkers);
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
                        lng: geom[0]
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
var phenomenaModule = angular.module('phenomenaModule', ['interfaceModule', 'statusModule'])
        .controller('PhenomenonListCtrl', ['$scope', 'PhenomenonListFactory', function ($scope, PhenomenonListFactory) {
                $scope.phenomena = PhenomenonListFactory.phenomena;

                $scope.showAllPhenomenons = function () {
                    PhenomenonListFactory.setSelection();
                };

                $scope.showSpecificPhenomenon = function (phenomenon) {
                    PhenomenonListFactory.setSelection(phenomenon);
                };

                $scope.isSelected = function (phenomenon) {
                    return angular.equals(phenomenon, $scope.phenomena.selection);
                };
            }])
        .factory('PhenomenonListFactory', ['$rootScope', 'interfaceService', 'statusService',
            function ($rootScope, interfaceService, statusService) {
                var phenomena = {};
                phenomena.items = [];

                loadPhenomena = function () {
                    var params = {
                        service: statusService.status.apiProvider.serviceID
                    };
                    interfaceService.getPhenomena(null, statusService.status.apiProvider.url, params).success(function (data, status, headers, config) {
                        phenomena.items = data;
                    });
                };

                setSelection = function (phenomenon) {
                    if (phenomenon) {
                        phenomena.selection = phenomenon;
                        $rootScope.$emit('phenomenonSelected', phenomenon);
                    } else {
                        phenomena.selection = null;
                        $rootScope.$emit('allPhenomenaSelected');
                    }
                };

                $rootScope.$on('newProviderSelected', loadPhenomena);

                loadPhenomena();
                return {
                    setSelection: setSelection,
                    phenomena: phenomena
                };
            }])
        .controller('phenomenaButtonController', ['$scope', 'statusService',
            function ($scope, statusService) {
                $scope.status = statusService.status;
                $scope.togglePhenomena = function () {
                    statusService.status.showPhenomena = !statusService.status.showPhenomena;
                };
            }]);
angular.module('providerModule', ['interfaceModule', 'statusModule'])
        .controller('ProviderButtonCtrl', ['$scope', '$modal',
            function ($scope, $modal) {
                $scope.selectProvider = function () {
                    // open provider list in modal window
                    $modal.open({
                        animation: true,
                        templateUrl: 'templates/map/provider-list-modal.html',
                        controller: 'ProviderListModalCtrl'
                    });
                };
            }])
        .controller('ProviderListModalCtrl', ['$scope', '$modalInstance', 'providerService',
            function ($scope, $modalInstance, providerService) {
                $scope.providerList = providerService.providerList;

                $scope.close = function () {
                    $modalInstance.close();
                };

                $scope.selectProvider = function (provider) {
                    providerService.selectProvider(provider);
                    $modalInstance.close();
                };
            }])
        .factory('providerService', ['$rootScope', 'settingsService', 'interfaceService', 'statusService',
            function ($rootScope, settingsService, interfaceService, statusService) {
                var providerList = [];

                var getAllProviders = function () {
                    angular.forEach(settingsService.restApiUrls, function (elem, url) {
                        interfaceService.getServices(url).success(function (providers) {
                            angular.forEach(providers, function (provider) {
                                var isBlacklisted = false;
                                angular.forEach(settingsService.providerBlackList, function (entry) {
                                    if (entry.serviceID === provider.id && entry.apiUrl === url) {
                                        isBlacklisted = true;
                                    }
                                });
                                if (!isBlacklisted) {
                                    if (url === statusService.status.apiProvider.url && statusService.status.apiProvider.serviceID === provider.id) {
                                        provider.selected = true;
                                    } else {
                                        provider.selected = false;
                                    }
                                    provider.url = url;
                                    providerList.push(provider);
                                } else {
                                    console.info(url + "services/" + provider.id + " is blacklisted!");
                                }
                            });
                        });
                    });
                };

                var selectProvider = function (selection) {
                    angular.forEach(providerList, function (provider) {
                        if (selection.id === provider.id && selection.url === provider.url) {
                            provider.selected = true;
                            statusService.status.apiProvider = {
                                url: provider.url,
                                serviceID: provider.id
                            };
                            $rootScope.$emit('newProviderSelected');
                        } else {
                            provider.selected = false;
                        }
                    });
                };

                getAllProviders();

                return {
                    providerList: providerList,
                    selectProvider: selectProvider
                };
            }]);
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