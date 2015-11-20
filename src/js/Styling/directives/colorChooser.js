angular.module('n52.core.style')
        .directive('swcColorChooser', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/styling/color-chooser.html',
                controller: ['$scope', 'colorService', 'styleService',
                    function ($scope, colorService, styleService) {
                        $scope.colorList = colorService.colorList;

                        $scope.selectColor = function (ts, color) {
                            styleService.updateColor(ts, color);
                            $scope.modalInstance.close();
                        };
                    }]
            };
        });