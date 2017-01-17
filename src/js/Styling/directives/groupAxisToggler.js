angular.module('n52.core.style')
        .directive('swcGroupAxisToggler', function () {
            return {
                restrict: 'E',
                templateUrl: 'n52.core.style.group-axis-toggler',
                controller: ['$scope', 'styleService', function ($scope, styleService) {
                        $scope.setGroupedAxis = function (ts) {
                            styleService.updateGroupAxis(ts);
                            $scope.modalInstance.close();
                        };
                    }]
            };
        });
