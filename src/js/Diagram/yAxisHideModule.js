angular.module('n52.core.yAxisHide', ['n52.core.timeseries'])
        .directive('yAxisHideButton', ['diagramBehaviourService',
            function () {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/diagram/y-axis-hide-button.html',
                    controller: 'yAxisHideControl'
                };
            }])
        .controller('yAxisHideCtrl', ['$scope', 'diagramBehaviourService', function ($scope, diagramBehaviourService) {
                $scope.behaviour = diagramBehaviourService.behaviour;
                $scope.toggleYAxis = function () {
                    diagramBehaviourService.toggleYAxis();
                };
            }]);