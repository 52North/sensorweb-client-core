angular.module('n52.core.interface', [])
    .service('interfaceService', ['$http', '$q', 'interfaceServiceUtils', 'utils',
        function($http, $q, interfaceServiceUtils, utils) {

            isNewApi = function(apiUrl) {
                return $q((resolve, reject) => {
                    $http.get(apiUrl).then(response => {
                        if (response && response.data && !isNaN(response.data.length)) {
                            response.data.forEach(entry => {
                                if (entry.id === 'platforms') {
                                    resolve(true);
                                }
                            });
                        }
                        resolve(false);
                    });
                });
            };

            getPlatforms = function(id, apiUrl, params) {
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'platforms/' + interfaceServiceUtils.createIdString(id), interfaceServiceUtils.createRequestConfigs(params))
                        .then(response => {
                            resolve(response.data);
                        }, error => {
                            interfaceServiceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getMobilePlatforms = function(id, apiUrl, params) {
                interfaceServiceUtils.extendParams(params, {
                    platformTypes: 'mobile'
                });
                return getPlatforms(id, apiUrl, params);
            };

            this.getStationaryPlatforms = function(id, apiUrl, params) {
                interfaceServiceUtils.extendParams(params, {
                    platformTypes: 'stationary'
                });
                return getPlatforms(id, apiUrl, params);
            };

            this.getServices = function(apiUrl, id) {
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'services/' + interfaceServiceUtils.createIdString(id), interfaceServiceUtils.createRequestConfigs({
                            expanded: true
                        }))
                        .then(response => {
                            resolve(response.data);
                        }, error => {
                            interfaceServiceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getStations = function(id, apiUrl, params) {
                return $q((resolve, reject) => {
                    isNewApi(apiUrl).then(isNew => {
                        if (isNew) {
                            interfaceServiceUtils.extendParams(params, {
                                expanded: true
                            });
                            this.getStationaryPlatforms(id, apiUrl, params)
                                .then(response => {
                                    if (isNaN(response.length)) {
                                        response.properties = {
                                            id: response.id
                                        };
                                    } else {
                                        response.forEach(entry => {
                                            entry.properties = {
                                                id: entry.id
                                            };
                                        });
                                    }
                                    resolve(response);
                                });
                        } else {
                            $http.get(apiUrl + 'stations/' + interfaceServiceUtils.createIdString(id), interfaceServiceUtils.createRequestConfigs(params))
                                .then(response => {
                                    resolve(response.data);
                                }, error => {
                                    interfaceServiceUtils.errorCallback(error, reject);
                                });
                        }
                    });
                });
            };

            this.getPhenomena = function(id, apiUrl, params) {
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'phenomena/' + interfaceServiceUtils.createIdString(id), interfaceServiceUtils.createRequestConfigs(params))
                        .then(response => {
                            resolve(response.data);
                        }, error => {
                            interfaceServiceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getCategories = function(id, apiUrl, params) {
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'categories/' + interfaceServiceUtils.createIdString(id), interfaceServiceUtils.createRequestConfigs(params))
                        .then(response => {
                            resolve(response.data);
                        }, error => {
                            interfaceServiceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getFeatures = function(id, apiUrl, params) {
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'features/' + interfaceServiceUtils.createIdString(id), interfaceServiceUtils.createRequestConfigs(params))
                        .then(response => {
                            resolve(response.data);
                        }, error => {
                            interfaceServiceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getProcedures = function(id, apiUrl, params) {
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'procedures/' + interfaceServiceUtils.createIdString(id), interfaceServiceUtils.createRequestConfigs(params))
                        .then(response => {
                            resolve(response.data);
                        }, error => {
                            interfaceServiceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.search = function(apiUrl, arrayParams) {
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'search', interfaceServiceUtils.createRequestConfigs({
                            q: arrayParams.join(',')
                        }))
                        .then(response => {
                            resolve(response.data);
                        }, error => {
                            interfaceServiceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getTimeseries = function(id, apiUrl, params) {
                if (angular.isUndefined(params))
                    params = {};
                params.expanded = true;
                params.force_latest_values = true;
                params.status_intervals = true;
                params.rendering_hints = true;
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'timeseries/' + interfaceServiceUtils.createIdString(id), interfaceServiceUtils.createRequestConfigs(params))
                        .then(response => {
                            if (angular.isArray(response.data)) {
                                var array = [];
                                angular.forEach(response.data, ts => {
                                    array.push(interfaceServiceUtils.pimpTs(ts, apiUrl));
                                });
                                resolve(array);
                            } else {
                                resolve(interfaceServiceUtils.pimpTs(response.data, apiUrl));
                            }
                        }, error => {
                            interfaceServiceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getExtras = function(tsId, apiUrl, params) {
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'timeseries/' + interfaceServiceUtils.createIdString(tsId) + '/extras', interfaceServiceUtils.createRequestConfigs(params))
                        .then(response => {
                            resolve(response.data);
                        }, error => {
                            interfaceServiceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getTsData = function(id, apiUrl, timespan, extendedData, generalizeData) {
                var params = {
                    timespan: utils.createRequestTimespan(timespan.start, timespan.end),
                    generalize: generalizeData || false,
                    expanded: true,
                    format: 'flot'
                };
                if (extendedData) {
                    angular.extend(params, extendedData);
                }
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'timeseries/' + interfaceServiceUtils.createIdString(id) + "/getData", interfaceServiceUtils.createRequestConfigs(params))
                        .then(response => {
                            interfaceServiceUtils.revampTimeseriesData(response.data, id);
                            resolve(response.data);
                        }, error => {
                            interfaceServiceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getDatasets = function(id, apiUrl, params) {
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'datasets/' + interfaceServiceUtils.createIdString(id), interfaceServiceUtils.createRequestConfigs(params))
                        .then(response => {
                            resolve(response.data);
                        }, error => {
                            interfaceServiceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getDatasetData = function(id, apiUrl, timespan, extendedParams) {
                var params = {
                    timespan: utils.createRequestTimespan(timespan.start, timespan.end)
                };
                if (extendedParams) {
                    angular.extend(params, extendedParams);
                }
                return $q((resolve, reject) => {
                    $http.get(apiUrl + 'datasets/' + interfaceServiceUtils.createIdString(id) + '/data', interfaceServiceUtils.createRequestConfigs(params))
                        .then(response => {
                            resolve(response.data);
                        }, error => {
                            interfaceServiceUtils.errorCallback(error, reject);
                        });
                });
            };
        }
    ])
    .service('interfaceServiceUtils', ['settingsService', 'utils', '$log',
        function(settingsService, utils, $log) {

            this.extendParams = function(params, extendParams) {
                if (!params) {
                    return extendParams;
                } else {
                    return angular.extend(params, extendParams);
                }
            };

            this.createRequestConfigs = function(params) {
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

            this.errorCallback = function(error, reject) {
                if (error.data && error.data.userMessage)
                    $log.error(error.data.userMessage);
                reject(error);
            };

            this.createIdString = function(id) {
                return (id === null || angular.isUndefined(id) ? "" : id);
            };

            this.pimpTs = function(ts, url) {
                ts.apiUrl = url;
                ts.internalId = utils.createInternalId(ts.id, url);
                if (ts.uom === settingsService.undefinedUomString) {
                    delete ts.uom;
                }
                return ts;
            };

            this.revampTimeseriesData = function(data, id) {
                if (data[id].values.length > 0 && data[id].values[0].timestamp) {
                    var temp = [];
                    angular.forEach(data[id].values, entry => {
                        temp.push([entry.timestamp, entry.value]);
                    });
                    data[id].values = temp;
                }
            };

        }
    ]);
