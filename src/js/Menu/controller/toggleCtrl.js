menuModule = angular.module('n52.core.menu')
        .controller('SwcToggleCtrl', ['$scope', function ($scope) {
                $scope.isToggled = false;
                $scope.toggle = function () {
                    $scope.isToggled = !$scope.isToggled;
                };
            }]);