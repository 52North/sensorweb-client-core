angular.module('n52.core.listSelection')
        .controller('SwcModalAccordionListSelectionCtrl', ['$scope', '$controller', '$location',
            function ($scope, $controller, $location) {
                var ctrl = $controller('SwcAccordionListSelectionCtrl', {$scope: $scope});
                var oldAddToDiagram = $scope.addToDiagram;
                angular.extend(this, ctrl);
                $scope.addToDiagram = function(params) {
                    oldAddToDiagram(params);
                    $location.url('/diagram');
                    $scope.$parent.close();
                };
            }]);