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