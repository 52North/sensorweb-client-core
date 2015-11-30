angular.module('n52.core.timeUi')
        .directive('swcTimeSelectorButtons', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/time/time-selector-buttons.html',
                controller: 'SwcForwardBackButtonsCtrl'
            };
        });