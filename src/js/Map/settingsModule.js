angular.module('n52.core.map')
        .controller('ClusterMarkerCtrl', ['$scope', '$rootScope', 'statusService',
            function ($scope, $rootScope, statusService) {
                $scope.status = statusService.status;
                $scope.toggle = function () {
                    statusService.status.clusterStations = !statusService.status.clusterStations;
                    $rootScope.$emit('redrawStations');
                };
            }])
        .controller('ConcentrationMarkerCtrl', ['$scope', '$rootScope', 'statusService',
            function ($scope, $rootScope, statusService) {
                $scope.status = statusService.status;
                $scope.toggle = function () {
                    statusService.status.concentrationMarker = !statusService.status.concentrationMarker;
                    $rootScope.$emit('redrawStations');
                };
            }]);