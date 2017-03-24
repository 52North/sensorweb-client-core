angular.module('n52.core.startup')
    .service('SetTimeseriesOfStatusService', ['permalinkEvaluationService', 'timeseriesService', 'statusService', 'seriesApiInterface',
        function(permalinkEvaluationService, timeseriesService, statusService, seriesApiInterface) {
            this.setsParameters = function() {
                // don't add timeseries of the status service when adding timeseries by permalink
                var hasTsParam = permalinkEvaluationService.hasParam('ts');
                if (!hasTsParam) {
                    angular.forEach(statusService.getTimeseries(), function(ts) {
                        if (ts.datasetType) {
                            seriesApiInterface.getDatasets(ts.id, ts.apiUrl)
                                .then((dataset) => {
                                    setSeries(ts, dataset);
                                });
                        } else {
                            seriesApiInterface.getTimeseries(ts.id, ts.apiUrl)
                            .then((timeseries) => {
                                setSeries(ts, timeseries);
                            });
                        }
                    });
                } else {
                    statusService.removeAllTimeseries();
                }
            };

            var setSeries = function(series, currentSeries) {
              series.firstValue = currentSeries.firstValue;
              series.lastValue = currentSeries.lastValue;
              timeseriesService.addTimeseries(series);
            };
        }
    ]);
