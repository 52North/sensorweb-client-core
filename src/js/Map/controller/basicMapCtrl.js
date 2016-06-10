angular.module('n52.core.map')
        .controller('SwcBasicMapCtrl', ['$scope', 'mapService', 'leafletData', '$rootScope',
          function ($scope, mapService, leafletData, $rootScope) {
            $scope.map = mapService.map;

            $rootScope.$on('resizeMap', function () {
              leafletData.getMap(mapService.map.id).then(function (map) {
                map.invalidateSize(false);
              });
            });
          }]);