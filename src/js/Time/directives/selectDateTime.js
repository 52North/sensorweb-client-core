angular.module('n52.core.timeUi')
        .directive('swcSelectDateTime', [
            function () {
                return {
                    restrict: 'E',
                    templateUrl: 'n52.core.timeUi.date-time-selection',
                    scope: {
                        date: '=',
                        title: '=',
                        max: '=',
                        min: '='
                    },
                    controller: ['$scope', 'timeService',
                        function ($scope) {
                            $scope.isToggled = false;
                            $scope.toggle = function() {
                                $scope.isToggled = !$scope.isToggled;
                            };
                        }]
                };
            }]);
