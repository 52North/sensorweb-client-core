angular.module('n52.core.legend')
        .directive('swcLegendEntry', [
            function () {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/legend/legend-entry.html',
                    scope: {
                        timeseries: "="
                    }
                };
            }]);