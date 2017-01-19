angular.module('n52.core.listSelection')
    .component('swcValidateParameterConstellation', {
        bindings: {
            params: '<',
            provider: '<',
            onToggle: '&'
        },
        templateUrl: 'n52.core.listSelection.validate-parameter-constellation',
        controller: ['seriesApiInterface', 'timeseriesService',
            function(seriesApiInterface, timeseriesService) {
                this.isActive = false;
                seriesApiInterface.getTimeseries(null, this.provider.url, this.params).then(data => {
                    if (angular.isArray(data)) {
                        this.series = data[0];
                    } else {
                        this.series = data;
                    }
                    this.checkActive(this.series);
                });
                this.toggleTs = function(series) {
                    this.onToggle({series: series});
                    if (!timeseriesService.hasTimeseries(series.internalId)) {
                        timeseriesService.addTimeseries(series);
                    } else {
                        timeseriesService.removeTimeseries(series.internalId);
                    }
                    this.checkActive(series);
                };
                this.checkActive = function(series) {
                    if (!timeseriesService.hasTimeseries(series.internalId)) {
                        this.isActive = false;
                    } else {
                        this.isActive = true;
                    }
                };
            }
        ]
    });
