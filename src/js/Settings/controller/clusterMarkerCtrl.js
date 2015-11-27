angular.module('n52.core.userSettings')
        .controller('SwcClusterMarkerCtrl', ['$scope', '$rootScope', 'statusService',
            function ($scope, $rootScope, statusService) {
                $scope.status = statusService.status;
                $scope.toggle = function () {
                    statusService.status.clusterStations = !statusService.status.clusterStations;
                    $rootScope.$emit('redrawStations');
                };
            }]);