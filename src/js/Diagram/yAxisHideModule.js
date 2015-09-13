angular.module('yAxisHideModule', ['timeseriesModule'])
        .directive('yAxisHideButton', ['diagramBehaviourService',
            function (diagramBehaviourService) {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/diagram/y-axis-hide-button.html',
                    controller: ['$scope', function ($scope) {
                        $scope.behaviour = diagramBehaviourService.behaviour;

                        $scope.toggleYAxis = function () {
                            diagramBehaviourService.toggleYAxis();
                        };
                    }]
                };
            }]);