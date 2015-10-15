angular.module('n52.core.locate', ['n52.core.station'])
        .controller('SwcLocateButtonCtrl', ['$scope', 'mapService', function ($scope, mapService) {
                $scope.isToggled = false;
                var interval;
                $scope.locateUser = function () {
                    // TODO need to be enhanced
                    $scope.isToggled = !$scope.isToggled;
                    if ($scope.isToggled) {
                        interval = setInterval(function(){
                            mapService.locateUser();
                        }, 10000);
                    } else {
                        clearInterval(interval);
                    }
                };
            }]);