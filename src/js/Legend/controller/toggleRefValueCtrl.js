angular.module('n52.core.legend')
        .controller('SwcToggleRefValueCtrl', ['$scope', 'timeseriesService',
            function ($scope, timeseriesService) {
                $scope.selectRefValue = function (refValue, ts) {
                    timeseriesService.toggleReferenceValue(refValue, ts.internalId);
                };
            }]);