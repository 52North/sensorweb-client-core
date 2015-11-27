angular.module('n52.core.legend')
        .controller('SwcToggleSelectionCtrl', ['$scope', 'styleService',
            function ($scope, styleService) {
                $scope.toggleSelection = function (ts) {
                    styleService.toggleSelection(ts);
                };
            }]);