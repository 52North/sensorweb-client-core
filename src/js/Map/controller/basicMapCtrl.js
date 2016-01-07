angular.module('n52.core.map')
        .controller('SwcBasicMapCtrl', ['$scope', 'mapService', 'leafletData', '$translate', '$rootScope',
            function ($scope, mapService, leafletData, $translate, $rootScope) {
                $scope.map = mapService.map;

                $rootScope.$on('resizeMap', function () {
                    leafletData.getMap().then(function (map) {
                        map.invalidateSize(false);
                    });
                });
            }]);