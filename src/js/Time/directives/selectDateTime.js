angular.module('n52.core.timeUi')
        .directive('swcSelectDateTime', [
            function () {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/time/date-time-selection.html',
                    scope: {
                        date: '=',
                        title: '='
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