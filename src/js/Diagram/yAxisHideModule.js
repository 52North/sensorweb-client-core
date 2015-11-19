angular.module('n52.core.yAxisHide', ['n52.core.timeseries'])
        .directive('yAxisHideButton', ['diagramBehaviourService',
            function () {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/diagram/y-axis-hide-button.html',
                    controller: 'yAxisHideCtrl'
                };
            }])
        .controller('yAxisHideCtrl', ['$scope', 'diagramBehaviourService', function ($scope, diagramBehaviourService) {
                $scope.behaviour = diagramBehaviourService.behaviour;
                $scope.toggleYAxis = function () {
                    diagramBehaviourService.toggleYAxis();
                };
            }]);