angular.module('n52.core.startup')
    .service('SetInternalTimeseriesService', ['permalinkEvaluationService', 'timeseriesService', 'utils', '$http',
        function(permalinkEvaluationService, timeseriesService, utils, $http) {
            this.setsParameters = function() {
                var timeseries = permalinkEvaluationService.getParam("ts");
                if (timeseries) {
                    var timeseriesObject = {};
                    angular.forEach(timeseries.split(","), function(internalID) {
                        if (internalID.indexOf('http') === 0) {
                            $http.get(internalID)
                                .then((result) => {
                                    var ts = result.data;
                                    if (internalID.indexOf('datasets') > 0) {
                                        ts.apiUrl = internalID.substring(0, internalID.indexOf('datasets'));
                                    } else {
                                        ts.apiUrl = internalID.substring(0, internalID.indexOf('timeseries'));
                                    }
                                    timeseriesService.addTimeseries(result.data);
                                });
                        } else {
                            var comb = utils.getTimeseriesCombinationByInternalId(internalID);
                            if (Object.keys(comb).length > 0) {
                                timeseriesService.addTimeseriesById(comb.id, comb.apiUrl);
                            }
                        }
                    });
                    return timeseriesObject;
                }
                return null;
            };
        }
    ]);
