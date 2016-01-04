angular.module('n52.core.locate', [])
        .directive('swcLocateUser', ['locateService',
            function (locateService) {
                return {
                    restrict: 'A',
                    link: function (scope, elem, attr) {
                        var mapId = attr.swcLocateUser;
                        scope.locateUser = function () {
                            scope.isToggled = !scope.isToggled;
                            locateService.locateUser(mapId, scope.isToggled);
                        };
                        scope.$on("$destroy", function(){
                            locateService.locateUser(mapId, false);
                        });
                    }
                };
            }])
        .factory('locateService', ['leafletData', 'settingsService', '$rootScope',
            function (leafletData, settingsService, $rootScope) {
                var marker,
                        locateIcon = settingsService.locateIconOptions ? L.icon(settingsService.locateIconOptions) : new L.Icon.Default();
                locateUser = function (mapId, search) {
                    leafletData.getMap(mapId).then(function (map) {
                        if (search) {
                            map.on('locationfound', function (evt) {
                                removeMarker(map);
                                marker = L.marker(evt.latlng, {icon: locateIcon}).addTo(map);
                            });
                            map.locate({
                                watch: true,
                                setView: true
//                                maxZoom: map.getZoom()
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
                    locateUser: locateUser
                };
            }]);