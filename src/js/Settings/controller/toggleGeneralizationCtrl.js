angular.module('n52.core.userSettings')
        .controller('SwcToggleGeneralizationCtrl', ['$scope', 'statusService', 'timeseriesService',
            function ($scope, statusService, timeseriesService) {
                $scope.isToggled = statusService.status.generalizeData;
                $scope.toggleGeneralization = function () {
                    $scope.isToggled = statusService.status.generalizeData = !statusService.status.generalizeData;
                    timeseriesService.timeChanged();
                };
            }]);
