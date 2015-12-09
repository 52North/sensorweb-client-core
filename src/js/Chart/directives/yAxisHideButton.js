angular.module('n52.core.yAxisHide', [])
        .directive('swcYaxisHideButton', ['diagramBehaviourService',
            function () {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/diagram/y-axis-hide-button.html',
                    controller: 'SwcYaxisHideCtrl'
                };
            }])
        .controller('SwcYaxisHideCtrl', ['$scope', 'diagramBehaviourService', function ($scope, diagramBehaviourService) {
                $scope.behaviour = diagramBehaviourService.behaviour;
                $scope.toggleYAxis = function () {
                    diagramBehaviourService.toggleYAxis();
                };
            }]);