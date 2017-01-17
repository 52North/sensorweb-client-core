angular.module('n52.core.map')
        .directive('swcStationLoading', [
            function () {
                return {
                    restrict: 'E',
                    templateUrl: 'n52.core.map.station-loading',
                    controller: 'SwcStationLoadingCtrl'
                };
            }])
        .controller('SwcStationLoadingCtrl', ['$scope', 'mapService',
            function ($scope, mapService) {
                $scope.map = mapService.map;
            }]);
