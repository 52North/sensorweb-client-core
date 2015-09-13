angular.module('permalinkGenCore', ['timeseriesModule'])
        .factory('permalinkGenerationService', ['$location', 'timeseriesService', 'timeService',
            function ($location, timeseriesService, timeService) {
                createTimeseriesParam = function () {
                    var ids = [];
                    angular.forEach(timeseriesService.getAllTimeseries(), function (elem) {
                        ids.push(elem.internalId);
                    });
                    return "ts=" + encodeURIComponent(ids.join());
                };

                createTimeParam = function () {
                    return "timespan=" + encodeURIComponent(timeService.getRequestTimespan());
                };

                getCurrentPermalink = function () {
                    var params = [];
                    var url = $location.absUrl();
                    var link;
                    if (url.indexOf('?') > 0) {
                        link = $location.absUrl().substring(0, $location.absUrl().indexOf('?'));
                    } else {
                        link = $location.absUrl();
                    }
                    link = link + '?';
                    // create timespan
                    params.push(createTimeParam());
                    // create id list
                    params.push(createTimeseriesParam());
                    return link + params.join("&");
                };

                return {
                    getCurrentPermalink: getCurrentPermalink
                };
            }]);

angular.module('permalinkEvalCore', ['utilsCore'])
        .factory('permalinkEvaluationService', ['$location', 'utils', function ($location, utils) {
                var parameters = $location.search();

                hasParam = function (name, parameters) {
                    return angular.isDefined(parameters[name]);
                };
                
                getParam = function (name) {
                    if (hasParam(name, parameters)) {
                        return parameters[name];
                    } else {
                        return null;
                    }
                };

                getTime = function () {
                    if (hasParam("timespan", parameters)) {
                        var timespan = parameters.timespan.split('/');
                        var time = {};
                        time.start = moment(timespan[0]);
                        time.end = moment(timespan[1]);
                        time.duration = moment.duration(time.end.diff(time.start));
                        return time;
                    }
                    return null;
                };

                getTimeseries = function () {
                    if (hasParam("ts", parameters)) {
                        var timeseries = {};
                        angular.forEach(parameters.ts.split(","), function (internalID) {
                            var comb = utils.getTimeseriesCombinationByInternalId(internalID);
                            if (Object.keys(comb).length > 0) {
                                timeseries[internalID] = comb;
                            }
                        });
                        return timeseries;
                    }
                    return null;
                };

                return {
                    getParam: getParam,
                    getTime: getTime,
                    getTimeseries: getTimeseries
                };
            }]);