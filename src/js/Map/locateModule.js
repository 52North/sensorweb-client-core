angular.module('n52.core.locate', ['n52.core.station'])
        .controller('SwcLocateButtonCtrl', ['$scope', 'leafletData', function ($scope, leafletData) {
                $scope.isToggled = false;
                var marker;
                leafletData.getMap().then(function (map) {
                    map.on('locationfound', function (evt, args) {
                        removeMarker(map);
                        marker = L.marker(evt.latlng, {}).addTo(map);
                    })
                })
                $scope.locateUser = function () {
                    $scope.isToggled = !$scope.isToggled;
                    leafletData.getMap().then(function (map) {
                        if ($scope.isToggled) {
                            map.locate({
                                watch: true,
                                setView: true
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
                }
            }]);
        