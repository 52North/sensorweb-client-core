angular.module('n52.core.map')
        .controller('SwcZoomControlsCtrl', ['$scope', 'mapService', function ($scope, mapService) {
                $scope.zoomIn = function () {
                    mapService.map.center.zoom = mapService.map.center.zoom + 1;
                };
                $scope.zoomOut = function () {
                    mapService.map.center.zoom = mapService.map.center.zoom - 1;
                };
            }]);