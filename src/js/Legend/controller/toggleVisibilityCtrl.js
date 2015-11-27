angular.module('n52.core.legend')
        .controller('SwcToggleVisibilityCtrl', ['$scope', 'styleService',
            function ($scope, styleService) {
                $scope.toggleVisibility = function (ts) {
                    styleService.toggleTimeseriesVisibility(ts);
                };
            }]);