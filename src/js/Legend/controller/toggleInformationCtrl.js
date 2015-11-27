angular.module('n52.core.legend')
        .controller('SwcToggleInformationCtrl', ['$scope',
            function ($scope) {
                $scope.infoVisible = false;
                $scope.showInformation = function () {
                    $scope.infoVisible = !$scope.infoVisible;
                };
            }]);