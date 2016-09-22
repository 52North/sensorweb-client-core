angular.module('n52.core.interface', [])
    .service('interfaceService', ['$http', '$q', 'interfaceServiceUtils', 'utils', 'interfaceV2Service',
        function($http, $q, interfaceServiceUtils, utils, interfaceV2Service) {

            this.getServices = function(apiUrl, id) {
                return $q(function(resolve, reject) {
                    $http.get(apiUrl + 'services/' + interfaceServiceUtils.createIdString(id), interfaceServiceUtils.createRequestConfigs({
                            expanded: true
                        }))
                        .then(function(response) {
                            resolve(response.data);
                        }, function(error) {
                            interfaceServiceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getStations = function(id, apiUrl, params) {
                return $q((resolve, reject) => {
                    this.getServices(apiUrl).then(response => {
                        if (isNaN(response[0].quantities.platforms)) {
                            $http.get(apiUrl + 'stations/' + interfaceServiceUtils.createIdString(id), interfaceServiceUtils.createRequestConfigs(params))
                                .then(function(response) {
                                    resolve(response.data);
                                }, function(error) {
                                    interfaceServiceUtils.errorCallback(error, reject);
                                });
                        } else {
                            interfaceServiceUtils.extendParams(params, {
                                expanded: true
                            });
                            interfaceV2Service.getStationaryPlatforms(id, apiUrl, params)
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
                        }
                    });
                });
            };

            this.getPhenomena = function(id, apiUrl, params) {
                return $q(function(resolve, reject) {
                    $http.get(apiUrl + 'phenomena/' + interfaceServiceUtils.createIdString(id), interfaceServiceUtils.createRequestConfigs(params))
                        .then(function(response) {
                            resolve(response.data);
                        }, function(error) {
                            interfaceServiceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getCategories = function(id, apiUrl, params) {
                return $q(function(resolve, reject) {
                    $http.get(apiUrl + 'categories/' + interfaceServiceUtils.createIdString(id), interfaceServiceUtils.createRequestConfigs(params))
                        .then(function(response) {
                            resolve(response.data);
                        }, function(error) {
                            interfaceServiceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getFeatures = function(id, apiUrl, params) {
                return $q(function(resolve, reject) {
                    $http.get(apiUrl + 'features/' + interfaceServiceUtils.createIdString(id), interfaceServiceUtils.createRequestConfigs(params))
                        .then(function(response) {
                            resolve(response.data);
                        }, function(error) {
                            interfaceServiceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getProcedures = function(id, apiUrl, params) {
                return $q(function(resolve, reject) {
                    $http.get(apiUrl + 'procedures/' + interfaceServiceUtils.createIdString(id), interfaceServiceUtils.createRequestConfigs(params))
                        .then(function(response) {
                            resolve(response.data);
                        }, function(error) {
                            interfaceServiceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.search = function(apiUrl, arrayParams) {
                return $q(function(resolve, reject) {
                    $http.get(apiUrl + 'search', interfaceServiceUtils.createRequestConfigs({
                            q: arrayParams.join(',')
                        }))
                        .then(function(response) {
                            resolve(response.data);
                        }, function(error) {
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
                return $q(function(resolve, reject) {
                    $http.get(apiUrl + 'timeseries/' + interfaceServiceUtils.createIdString(id), interfaceServiceUtils.createRequestConfigs(params))
                        .then(function(response) {
                            if (angular.isArray(response.data)) {
                                var array = [];
                                angular.forEach(response.data, function(ts) {
                                    array.push(interfaceServiceUtils.pimpTs(ts, apiUrl));
                                });
                                resolve(array);
                            } else {
                                resolve(interfaceServiceUtils.pimpTs(response.data, apiUrl));
                            }
                        }, function(error) {
                            interfaceServiceUtils.errorCallback(error, reject);
                        });
                });
            };

            this.getExtras = function(tsId, apiUrl, params) {
                return $q(function(resolve, reject) {
                    $http.get(apiUrl + 'timeseries/' + interfaceServiceUtils.createIdString(tsId) + '/extras', interfaceServiceUtils.createRequestConfigs(params))
                        .then(function(response) {
                            resolve(response.data);
                        }, function(error) {
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
                return $q(function(resolve, reject) {
                    $http.get(apiUrl + 'timeseries/' + interfaceServiceUtils.createIdString(id) + "/getData", interfaceServiceUtils.createRequestConfigs(params))
                        .then(function(response) {
                            interfaceServiceUtils.revampTimeseriesData(response.data, id);
                            resolve(response.data);
                        }, function(error) {
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
                    angular.forEach(data[id].values, function(entry) {
                        temp.push([entry.timestamp, entry.value]);
                    });
                    data[id].values = temp;
                }
            };

        }
    ]);
