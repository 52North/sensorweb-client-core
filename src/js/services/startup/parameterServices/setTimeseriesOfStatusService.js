angular.module('n52.core.startup')
        .service('SetTimeseriesOfStatusService', ['permalinkEvaluationService', 'timeseriesService', 'statusService',
            function (permalinkEvaluationService, timeseriesService, statusService) {
                this.setsParameters = function () {
                    var showStatusTs = permalinkEvaluationService.getParam('showStatusTs');
                    if (!angular.isObject(showStatusTs) && showStatusTs !== "false") {
                        angular.forEach(statusService.getTimeseries(), function (ts) {
                            timeseriesService.addTimeseriesById(ts.id, ts.apiUrl);
                        });
                    } else {
                        statusService.removeAllTimeseries();
                    }
                };
            }]);