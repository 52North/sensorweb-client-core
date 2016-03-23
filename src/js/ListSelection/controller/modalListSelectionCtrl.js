angular.module('n52.core.listSelection')
        .controller('SwcModalListSelectionCtrl', ['$scope', '$controller', '$location',
            function ($scope, $controller, $location) {
                var ctrl = $controller('SwcListSelectionCtrl', {$scope: $scope});
                var oldAddToDiagram = $scope.addToDiagram;
                angular.extend(this, ctrl);
                $scope.addToDiagram = function(params, url) {
                    oldAddToDiagram(params, url);
                    $location.url('/diagram');
                    $scope.$parent.close();
                };
            }]);