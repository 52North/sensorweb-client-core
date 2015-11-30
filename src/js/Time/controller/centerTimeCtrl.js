angular.module('n52.core.timeUi')
        .controller('SwcCenterTimeCtrl', ['$scope', 'timeService',
            function ($scope, timeService) {
                $scope.centerTime = function(timespan) {
                    timeService.centerTimespan(timespan);
                };
            }]);