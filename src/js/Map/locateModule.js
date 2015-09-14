angular.module('n52.core.locate', ['n52.core.station'])
        .controller('LocateButtonCtrl', ['$scope', 'mapService', function ($scope, mapService) {
                $scope.locateUser = function () {
                    mapService.locateUser();
                };
            }]);