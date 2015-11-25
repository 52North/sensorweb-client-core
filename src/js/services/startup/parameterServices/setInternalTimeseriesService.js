angular.module('n52.core.startup')
        .service('SetInternalTimeseriesService', ['permalinkEvaluationService', 'timeseriesService', 'utils',
            function (permalinkEvaluationService, timeseriesService, utils) {
                this.setsParameters = function () {
                    var timeseries = permalinkEvaluationService.getParam("ts");
                    if (timeseries) {
                        var timeseriesObject = {};
                        angular.forEach(timeseries.split(","), function (internalID) {
                            var comb = utils.getTimeseriesCombinationByInternalId(internalID);
                            if (Object.keys(comb).length > 0) {
                                timeseriesService.addTimeseriesById(comb.id, comb.apiUrl);
                            }
                        });
                        return timeseriesObject;
                    }
                    return null;
                };
            }]);