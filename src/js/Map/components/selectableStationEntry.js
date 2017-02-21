angular.module('n52.core.map')
    .component('swcSelectableStationEntry', {
        bindings: {
            timeseriesId: '<',
            timeseries: '<',
            serviceUrl: '<'
        },
        templateUrl: 'n52.core.map.selectable-station-entry',
        controller: ['seriesApiInterface',
            function(seriesApiInterface) {
                this.$onInit = function() {
                    seriesApiInterface.getTimeseries(this.timeseriesId, this.serviceUrl).then((ts) => {
                        angular.extend(this.timeseries, ts);
                    });
                };
            }
        ]
    });
