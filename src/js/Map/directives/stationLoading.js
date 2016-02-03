angular.module('n52.core.map')
        .directive('swcStationLoading', [
            function () {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/map/station-loading.html',
                    controller: 'SwcStationLoadingCtrl'
                };
            }])
        .controller('SwcStationLoadingCtrl', ['$scope', 'mapService',
            function ($scope, mapService) {
                $scope.map = mapService.map;
            }]);