angular.module('n52.core.legend')
        .controller('SwcShowInMapCtrl', ['$scope', 'mapService', '$location',
            function ($scope, mapService, $location) {
                $scope.showInMap = function (ts) {
                    mapService.showStation(ts);
                    $location.url('/map');
                };
            }]);