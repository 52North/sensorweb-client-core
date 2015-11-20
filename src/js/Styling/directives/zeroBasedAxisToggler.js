angular.module('n52.core.style')
        .directive('swcZeroBasedAxisToggler', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/styling/zero-based-axis-toggler.html',
                controller: ['$scope', 'styleService', function ($scope, styleService) {
                        $scope.setZeroScaled = function (ts) {
                            styleService.updateZeroScaled(ts);
                            $scope.modalInstance.close();
                        };
                    }]
            };
        });