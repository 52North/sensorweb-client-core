angular.module('n52.core.timeUi')
        .controller('SwcPredefinedTimeRangeControls', ['$scope', 'settingsService',
            function ($scope, settingsService) {
                $scope.items = settingsService.timeRangeData.presets;
            }]);