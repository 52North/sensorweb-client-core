angular.module('n52.core.startup')
        .service('SetTimeseriesOfStatusService', ['permalinkEvaluationService', 'timeseriesService', 'statusService',
            function (permalinkEvaluationService, timeseriesService, statusService) {
                this.setsParameters = function () {
                    // don't add timeseries of the status service when adding timeseries by permalink
                    var hasTsParam = permalinkEvaluationService.hasParam('ts');
                    if (!hasTsParam) {
                        angular.forEach(statusService.getTimeseries(), function (ts) {
                            timeseriesService.addTimeseries(ts);
                        });
                    } else {
                        statusService.removeAllTimeseries();
                    }
                };
            }]);
