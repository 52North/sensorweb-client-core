angular.module('n52.core.timeRange')
        .controller('SwcCenterTimeCtrl', ['$scope', 'timeService',
            function ($scope, timeService) {
                $scope.centerTime = function(timespan) {
                    timeService.centerTimespan(timespan);
                };
            }]);