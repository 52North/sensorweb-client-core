angular.module('n52.core.map')
        .controller('SwcBasicMapCtrl', ['$scope', 'mapService', 'leafletData', '$log', '$translate', '$compile', '$rootScope',
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
            }]);