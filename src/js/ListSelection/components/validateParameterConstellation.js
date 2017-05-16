angular.module('n52.core.listSelection')
    .component('swcValidateParameterConstellation', {
        bindings: {
            params: '<',
            provider: '<',
            onToggle: '&'
        },
        templateUrl: 'n52.core.listSelection.validate-parameter-constellation',
        controller: ['seriesApiInterface', 'timeseriesService', 'utils',
            function(seriesApiInterface, timeseriesService, utils) {
                seriesApiInterface.getTimeseries(null, this.provider.url, this.params).then(data => {
                    if (angular.isArray(data)) {
                        this.series = data;
                    } else {
                        this.series = [data];
                    }
                    this.series.forEach(entry => {
                        entry.internalId = utils.createInternalId(entry);
                    });
                });
                this.toggleTs = function(series) {
                    this.onToggle({series: series});
                    if (!timeseriesService.hasTimeseries(series.internalId)) {
                        timeseriesService.addTimeseries(series);
                    } else {
                        timeseriesService.removeTimeseries(series.internalId);
                    }
                };
                this.isDisplayed = function(series) {
                    if (!timeseriesService.hasTimeseries(series.internalId)) {
                        return false;
                    } else {
                        return true;
                    }
                };
            }
        ]
    });
