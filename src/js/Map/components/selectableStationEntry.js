angular.module('n52.core.map')
    .component('swcSelectableStationEntry', {
        bindings: {
            timeseriesId: '<',
            timeseries: '<',
            serviceUrl: '<'
        },
        templateUrl: 'n52.core.map.selectable-station-entry',
        controller: ['seriesApiInterface', 'utils',
            function(seriesApiInterface, utils) {
                this.$onInit = function() {
                    this.fetchTimeseries();
                };

                this.$onChanges = function(changeObj) {
                    if (changeObj.timeseriesId || changeObj.timeseries) {
                        this.fetchTimeseries();
                    }
                };

                this.fetchTimeseries = function() {
                    if (this.timeseriesId && this.timeseries) {
                        seriesApiInterface.getTimeseries(this.timeseriesId, this.serviceUrl).then((ts) => {
                            ts.internalId = utils.createInternalId(ts);
                            angular.extend(this.timeseries, ts);
                        });
                    }
                };
            }
        ]
    });
