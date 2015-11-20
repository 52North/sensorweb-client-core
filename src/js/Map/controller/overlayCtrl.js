angular.module('n52.core.map')
        .controller('SwcOverlayCtrl', ['$scope', 'mapService', function ($scope, mapService) {
                $scope.baseLayers = mapService.map.layers.overlays;
                $scope.switchVisibility = function (layer) {
                    layer.visible = !layer.visible;
                };
            }]);