angular.module('n52.core.map')
        .controller('SwcBaseLayerCtrl', ['$scope', 'mapService', 'leafletData',
          function ($scope, mapService, leafletData) {
            leafletData.getMap(mapService.map.id).then(function (map) {
              leafletData.getLayers(mapService.map.id).then(function (layers) {
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
              leafletData.getMap(mapService.map.id).then(function (map) {
                leafletData.getLayers(mapService.map.id).then(function (layers) {
                  angular.forEach(layers.baselayers, function (layer) {
                    map.removeLayer(layer);
                  });
                  if (angular.isDefined(layers.baselayers[key])) {
                    map.addLayer(layers.baselayers[key]);
                  }
                });
              });
            };
          }]);