angular.module('n52.core.legend')
        .directive('swcLegendEntry', [
            function () {
                return {
                    restrict: 'E',
                    templateUrl: 'n52.core.legend.legend-entry',
                    scope: {
                        timeseries: "="
                    }
                };
            }]);
