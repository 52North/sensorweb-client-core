angular.module('n52.core.style')
        .directive('swcZeroBasedAxisToggler', function () {
            return {
                restrict: 'E',
                templateUrl: 'n52.core.style.zero-based-axis-toggler',
                controller: ['$scope', 'styleService', function ($scope, styleService) {
                        $scope.setZeroScaled = function (ts) {
                            styleService.updateZeroScaled(ts);
                            $scope.modalInstance.close();
                        };
                    }]
            };
        });
