angular.module('n52.core.style')
        .directive('swcBarToggler', function () {
            return {
                restrict: 'E',
                templateUrl: 'n52.core.style.bar-toggler',
                controller: ['$scope', 'styleService', function ($scope, styleService) {
                        $scope.intervals = styleService.intervalList;
                        $scope.setInterval = function (ts, interval) {
                            styleService.updateInterval(ts, interval);
                            $scope.modalInstance.close();
                        };
                    }]
            };
        });
