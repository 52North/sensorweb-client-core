angular.module('n52.core.permalinkGen', [])
        .factory('permalinkGenerationService', ['$location', 'timeseriesService', 'timeService', 'utils',
            function ($location, timeseriesService, timeService, utils) {
                createTimeseriesParam = function (timeseriesId) {
                    var ids = [];
                    if (angular.isUndefined(timeseriesId)) {
                        angular.forEach(timeseriesService.getAllTimeseries(), function (elem) {
                            ids.push(elem.internalId);
                        });
                    } else {
                        ids.push(timeseriesId);
                    }
                    return "ts=" + encodeURIComponent(ids.join());
                };
                createTimeParam = function () {
                    var timespan = timeService.getCurrentTimespan();
                    return "timespan=" + encodeURIComponent(utils.createRequestTimespan(timespan.start, timespan.end));
                };
                getCurrentPermalink = function (timeseriesId) {
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
                    params.push(createTimeseriesParam(timeseriesId));
                    return link + params.join("&");
                };
                return {
                    getCurrentPermalink: getCurrentPermalink
                };
            }]);
angular.module('n52.core.permalinkEval', ['n52.core.utils'])
        .factory('permalinkEvaluationService', ['$location', 'utils',
            function ($location, utils) {
                var parameters = $location.search();
                hasParam = function (name) {
                    return angular.isDefined(parameters[name]);
                };
                getParam = function (name) {
                    if (hasParam(name, parameters)) {
                        return parameters[name];
                    }
                    return null;
                };
                getParameterArray = function (param) {
                    var array = getParam(param);
                    if (angular.isString(array)) {
                        return array.split(',');
                    }
                    return null;
                };
                return {
                    hasParam: hasParam,
                    getParam: getParam,
                    getParameterArray: getParameterArray
                };
            }]);