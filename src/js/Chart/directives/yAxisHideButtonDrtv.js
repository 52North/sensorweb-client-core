angular.module('n52.core.diagram')
    .directive('swcYaxisHideButton', ['diagramBehaviourService',
        function() {
            return {
                restrict: 'E',
                templateUrl: 'n52.core.diagram.y-axis-hide-button',
                controller: 'SwcYaxisHideCtrl'
            };
        }
    ])
    .controller('SwcYaxisHideCtrl', ['$scope', 'diagramBehaviourService', function($scope, diagramBehaviourService) {
        $scope.behaviour = diagramBehaviourService.behaviour;
        $scope.toggleYAxis = function() {
            diagramBehaviourService.toggleYAxis();
        };
    }]);
