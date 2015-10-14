angular.module('n52.core.interface', ['ngResource', 'n52.core.status'])
        .service('interfaceService', ['$http', '$q', 'statusService', 'settingsService', 'styleService', 'utils',
            function ($http, $q, statusService, settingsService, styleService, utils) {

                var _createRequestConfigs = function (params) {
                    if (angular.isUndefined(params)) {
                        params = settingsService.additionalParameters;
                    } else {
                        angular.extend(params, settingsService.additionalParameters);
                    }
                    return {
                        params: params,
                        cache: true
                    };
                };

                var _createIdString = function (id) {
                    return (id === null ? "" : id);
                };

                function _pimpTs(ts, url) {
                    styleService.createStylesInTs(ts);
                    ts.apiUrl = url;
                    ts.internalId = utils.createInternalId(ts.id, url);
                    return ts;
                }

                this.getServices = function (apiUrl) {
                    return $http.get(apiUrl + 'services', _createRequestConfigs({expanded: true}));
                };

                this.getStations = function (id, apiUrl, params) {
                    return $http.get(apiUrl + 'stations/' + _createIdString(id), _createRequestConfigs(params));
                };

                this.getPhenomena = function (id, apiUrl, params) {
                    return $http.get(apiUrl + 'phenomena/' + _createIdString(id), _createRequestConfigs(params));
                };

                this.getCategories = function (id, apiUrl, params) {
                    return $http.get(apiUrl + 'categories/' + _createIdString(id), _createRequestConfigs(params));
                };

                this.getFeatures = function (id, apiUrl, params) {
                    return $http.get(apiUrl + 'features/' + _createIdString(id), _createRequestConfigs(params));
                };

                this.getProcedures = function (id, apiUrl, params) {
                    return $http.get(apiUrl + 'procedures/' + _createIdString(id), _createRequestConfigs(params));
                };

                this.getTimeseries = function (id, apiUrl, params) {
                    if (angular.isUndefined(params))
                        params = {};
                    params.expanded = true;
                    params.force_latest_values = true;
                    params.status_intervals = true;
                    params.rendering_hints = true;
                    return $q(function (resolve, reject) {
                        $http.get(apiUrl + 'timeseries/' + _createIdString(id), _createRequestConfigs(params)).success(function (data) {
                            if (angular.isArray(data)) {
                                angular.forEach(data, function (ts) {
                                    _pimpTs(ts, apiUrl);
                                });
                            } else {
                                resolve(_pimpTs(data, apiUrl));
                            }
                        });
                    });
                };

                this.getTsData = function (id, apiUrl, timespan, extendedData) {
                    var params = {
                        timespan: timespan,
                        generalize: statusService.status.generalizeData || false,
                        expanded: true,
                        format: 'flot'
                    };
                    if (extendedData) {
                        angular.extend(params, extendedData);
                    }
                    return $http.get(apiUrl + 'timeseries/' + _createIdString(id) + "/getData", _createRequestConfigs(params));
                };
            }]);