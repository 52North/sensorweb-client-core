angular.module('n52.core.userSettings')
        .controller('ToggleGeneralizationCtrl', ['$scope', 'statusService', '$rootScope',
            function ($scope, statusService, $rootScope) {
                $scope.isToggled = statusService.status.generalizeData;
                $scope.toggleGeneralization = function () {
                    $scope.isToggled = statusService.status.generalizeData = !statusService.status.generalizeData;
                    $rootScope.$emit('timeExtentChanged');
                };
            }]);