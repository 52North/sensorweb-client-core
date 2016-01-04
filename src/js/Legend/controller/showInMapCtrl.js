angular.module('n52.core.legend')
        .controller('SwcShowInMapCtrl', ['$scope', 'locateStationService', '$location',
            function ($scope, locateStationService, $location) {
                $scope.showInMap = function (ts) {
                    locateStationService.showStation('stationMap', 'mapService', ts);
                    $location.url('/map');
                };
            }]);