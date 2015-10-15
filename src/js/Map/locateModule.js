angular.module('n52.core.locate', ['n52.core.station'])
        .controller('SwcLocateButtonCtrl', ['$scope', 'leafletData', 'locateService', function ($scope, leafletData, locateService) {
                $scope.isToggled = false;
                $scope.locateUser = function () {
                    $scope.isToggled = !$scope.isToggled;
                    locateService.locate($scope.isToggled);
                };
                
            }])
        .factory('locateService', ['leafletData',
            function (leafletData) {
                var marker;
                leafletData.getMap().then(function (map) {
                    map.on('locationfound', function (evt, args) {
                        removeMarker(map);
                        marker = L.marker(evt.latlng, {}).addTo(map);
                    })
                });
                locate = function(search){
                    leafletData.getMap().then(function (map) {
                        if (search) {
                            map.locate({
                                watch: true,
                                setView: true
                            });
                        } else {
                            map.stopLocate();
                            removeMarker(map);
                        }
                    });
                }
                removeMarker = function (map) {
                    if (angular.isDefined(marker)) {
                        map.removeLayer(marker);
                    }
                }
                return {
                    locate: locate
                }
            }]);