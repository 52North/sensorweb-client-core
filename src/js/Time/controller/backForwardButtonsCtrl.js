angular.module('n52.core.timeUi')
        .controller('SwcForwardBackButtonsCtrl', ['$scope', 'timeService',
            function ($scope, timeService) {
                $scope.time = timeService.time;

                $scope.back = function () {
                    timeService.stepBack();
                };

                $scope.forward = function () {
                    timeService.stepForward();
                };
            }]);