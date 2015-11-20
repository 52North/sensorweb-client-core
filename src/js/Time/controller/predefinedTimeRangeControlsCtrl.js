angular.module('n52.core.timeRange')
        .controller('SwcPredefinedTimeRangeControls', ['$scope', 'settingsService',
            function ($scope, settingsService) {
                $scope.items = settingsService.timeRangeData.presets;
            }]);