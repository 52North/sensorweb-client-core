angular.module('n52.core.map')
        .controller('SwcMapLayerCtrl', ['$scope', function ($scope) {
                $scope.isToggled = false;
                $scope.openMenu = function () {
                    $scope.isToggled = true;
                };
                $scope.closeMenu = function () {
                    $scope.isToggled = false;
                };
            }]);