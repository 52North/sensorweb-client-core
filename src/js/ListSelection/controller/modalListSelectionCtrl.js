angular.module('n52.core.listSelection')
    .controller('SwcModalListSelectionCtrl', ['$scope', '$controller', '$location',
        function($scope, $controller, $location) {
            var ctrl = $controller('SwcListSelectionCtrl', {
                $scope: $scope
            });
            var oldProcessSelection = $scope.processSelection;
            angular.extend(this, ctrl);
            $scope.processSelection = function(params, url) {
                oldProcessSelection(params, url);
                $scope.$parent.close();
            };
        }
    ]);
