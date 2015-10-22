angular.module('n52.core.listSelection', ['n52.core.interface', 'n52.core.status'])
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

angular.module('n52.core.locate', ['n52.core.station'])
        .controller('SwcLocateButtonCtrl', ['$scope', 'locateService', function ($scope, locateService) {
                $scope.isToggled = false;
                $scope.locateUser = function () {
                    $scope.isToggled = !$scope.isToggled;
                    locateService.locate($scope.isToggled);
                };
            }])
        .factory('locateService', ['leafletData', 'settingsService',
            function (leafletData, settingsService) {
                var marker;
                var locateIcon = settingsService.locateIconOptions ? L.icon(settingsService.locateIconOptions) : new L.Icon.Default();
                leafletData.getMap().then(function (map) {
                    map.on('locationfound', function (evt) {
                        removeMarker(map);
                        marker = L.marker(evt.latlng, {icon: locateIcon}).addTo(map);
                    });
                });
                locate = function (search) {
                    leafletData.getMap().then(function (map) {
                        if (search) {
                            map.locate({
                                watch: true,
                                setView: true,
                                maxZoom: map.getZoom()
                            });
                        } else {
                            map.stopLocate();
                            removeMarker(map);
                        }
                    });
                };
                removeMarker = function (map) {
                    if (angular.isDefined(marker)) {
                        map.removeLayer(marker);
                    }
                };
                return {
                    locate: locate
                };
            }]);
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
                                name: 'Open Street Map',
                                type: 'xyz',
                                url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                                layerOptions: {
                                    showOnSelector: true
                                }
                            },
                            mapbox_light: {
                                name: 'Mapbox Light',
                                url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                                type: 'xyz',
                                layerOptions: {
                                    apikey: 'pk.eyJ1IjoiYnVmYW51dm9scyIsImEiOiJLSURpX0pnIn0.2_9NrLz1U9bpwMQBhVk97Q',
                                    mapid: 'bufanuvols.lia22g09'
                                }
                            },
                            cycle: {
                                name: 'OpenCycleMap',
                                type: 'xyz',
                                url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
                                layerOptions: {
                                    subdomains: ['a', 'b', 'c'],
                                    attribution: '&copy; <a href="http://www.opencyclemap.org/copyright">OpenCycleMap</a> contributors - &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                                    continuousWorld: true
                                }
                            }
                        },
                        overlays: {
                            cluster: {
                                name: 'Stations',
                                type: 'markercluster',
                                visible: true,
                                layerOptions: {
                                    showOnSelector: false
                                }
                            },
                            hillshade: {
                                name: 'Hillshade Europa',
                                type: 'wms',
                                url: 'http://129.206.228.72/cached/hillshade',
                                visible: false,
                                layerOptions: {
                                    layers: 'europe_wms:hs_srtm_europa',
                                    format: 'image/png',
                                    opacity: 0.25,
                                    attribution: 'Hillshade layer by GIScience http://www.osm-wms.de',
                                    crs: L.CRS.EPSG900913
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
angular.module('n52.core.phenomena', ['n52.core.interface', 'n52.core.status'])
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
angular.module('n52.core.provider', ['n52.core.interface', 'n52.core.status'])
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
        .controller('ProviderLabelCtrl', ['$scope', 'providerService',
            function ($scope, providerService) {
                $scope.selectedProvider = providerService.selectedProvider;
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
                var selectedProvider = {
                    label: ""
                };

                getAllProviders = function () {
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
                                        selectedProvider.label = provider.label;  
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
                
                selectProvider = function (selection) {
                    angular.forEach(providerList, function (provider) {
                        if (selection.id === provider.id && selection.url === provider.url) {
                            provider.selected = true;
                            selectedProvider.label = provider.label;
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
                    selectedProvider: selectedProvider,
                    selectProvider: selectProvider
                };
            }]);
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