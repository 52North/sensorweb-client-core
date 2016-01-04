angular.module('n52.core.legend')
        .controller('SwcShowInMapCtrl', ['$scope', 'locatStationService', '$location',
            function ($scope, locatStationService, $location) {
                $scope.showInMap = function (ts) {
                    locatStationService.showStation('stationMap', 'mapService', ts);
                    $location.url('/map');
                };
            }]);