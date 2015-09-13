angular.module('locateModule', ['stationModule'])
        .controller('LocateButtonCtrl', ['$scope', 'mapService', function ($scope, mapService) {
                $scope.locateUser = function () {
                    mapService.locateUser();
                };
            }]);