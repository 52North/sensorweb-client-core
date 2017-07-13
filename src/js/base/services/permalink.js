angular.module('n52.core.base')
    .service('permalinkGenerationService', ['$location', 'timeseriesService', 'statusService', 'utils',
        function($location, timeseriesService, statusService, utils) {
            var createTimeseriesParam = function(timeseriesId) {
                var ids = [];
                if (angular.isUndefined(timeseriesId)) {
                    angular.forEach(timeseriesService.getAllTimeseries(), function(elem) {
                        if (elem.datasetType || elem.valueType) {
                            ids.push(elem.apiUrl + 'datasets/' + elem.id);
                        } else {
                            ids.push(elem.apiUrl + 'timeseries/' + elem.id);
                        }
                    });
                } else {
                    ids.push(timeseriesId);
                }
                return "ts=" + encodeURIComponent(ids.join());
            };
            var createTimeParam = function() {
                var timespan = statusService.getTime();
                return "timespan=" + encodeURIComponent(utils.createRequestTimespan(timespan.start, timespan.end));
            };
            var createBaseUrl = function(path) {
                if (path) {
                    return $location.absUrl().substring(0, $location.absUrl().indexOf($location.path())) + path + '?';
                } else {
                    return $location.absUrl().substring(0, $location.absUrl().indexOf('?')) + '?';
                }
            };
            this.createPermalink = function(path, params) {
                var parameterArray = [];
                for (var property in params) {
                    if (params.hasOwnProperty(property)) {
                        parameterArray.push(property + '=' + encodeURIComponent(params[property]));
                    }
                }
                return createBaseUrl(path) + parameterArray.join("&");
            };
            this.getCurrentPermalink = function(timeseriesId) {
                var params = [];
                // create timespan
                params.push(createTimeParam());
                // create id list
                params.push(createTimeseriesParam(timeseriesId));
                return createBaseUrl('/diagram') + params.join("&");
            };
        }
    ])
    .factory('permalinkEvaluationService', ['$location',
        function($location) {
            var parameters = $location.search();
            var hasParam = function(name) {
                return angular.isDefined(parameters[name]);
            };
            var getParam = function(name) {
                if (hasParam(name, parameters)) {
                    return parameters[name];
                }
                return null;
            };
            var getParameterArray = function(param) {
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
        }
    ]);
