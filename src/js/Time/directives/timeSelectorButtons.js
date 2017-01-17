angular.module('n52.core.timeUi')
        .directive('swcTimeSelectorButtons', function () {
            return {
                restrict: 'E',
                templateUrl: 'n52.core.timeUi.time-selector-buttons',
                controller: 'SwcForwardBackButtonsCtrl'
            };
        });
