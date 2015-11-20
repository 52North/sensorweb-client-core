angular.module('n52.core.userSettings')
        .controller('ConcentrationMarkerCtrl', ['$scope', '$rootScope', 'statusService',
            function ($scope, $rootScope, statusService) {
                $scope.status = statusService.status;
                $scope.toggle = function () {
                    statusService.status.concentrationMarker = !statusService.status.concentrationMarker;
                    $rootScope.$emit('redrawStations');
                };
            }]);