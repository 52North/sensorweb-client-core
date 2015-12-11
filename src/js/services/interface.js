angular.module('n52.core.interface', [])
        .service('interfaceService', ['$http', '$q', 'statusService', 'settingsService', 'utils', '$log',
            function ($http, $q, statusService, settingsService, utils, $log) {

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

                _errorCallback = function (error, reject) {
                    if (error.data && error.data.userMessage)
                        $log.error(error.data.userMessage);
                    reject(error);
                };

                _createIdString = function (id) {
                    return (id === null ? "" : id);
                };

                _pimpTs = function (ts, url) {
                    ts.apiUrl = url;
                    ts.internalId = utils.createInternalId(ts.id, url);
                    return ts;
                };

                _isV2 = function (url) {
                    if (url.indexOf('v2') > -1) {
                        return true;
                    } else {
                        return false;
                    }
                };

                this.getServices = function (apiUrl) {
                    var isV2 = _isV2(apiUrl);
                    return $q(function (resolve, reject) {
                        $http.get(apiUrl + 'services', _createRequestConfigs({expanded: true})).then(function (response) {
                            if (isV2) {
                                resolve(response.data.services);
                            } else {
                                resolve(response.data);
                            }
                        }, function (error) {
                            _errorCallback(error, reject);
                        });
                    });
                };

                this.getStations = function (apiUrl, params) {
                    var url, isV2 = _isV2(apiUrl);
                    if (isV2) {
                        url = apiUrl + 'features/';
                        var extParams = {
                            type: 'stationary',
                            expanded: true
                        };
                        if (angular.isUndefined(params)) {
                            params = extParams;
                        } else {
                            angular.extend(params, extParams);
                        }
                    } else {
                        url = apiUrl + 'stations/';
                    }
                    return $q(function (resolve, reject) {
                        $http.get(url, _createRequestConfigs(params)).then(function (response) {
                            var stations = [];
                            if (isV2) {
                                angular.forEach(response.data.features, function (feature) {
                                    feature.properties.id = feature.properties.platform;
                                    stations.push(new Station(feature.properties, feature.geometry));
                                });
                                resolve(stations);
                            } else {
                                angular.forEach(response.data, function (entry) {
                                    stations.push(new Station(entry.properties, entry.geometry));
                                });
                                resolve(stations);
                            }
                        }, function (error) {
                            _errorCallback(error, reject);
                        });
                    });
                };

                this.getTimeseriesForStation = function (station, apiUrl, params) {
                    var url, isV2 = _isV2(apiUrl);
                    if (isV2) {
                        url = apiUrl + 'platforms/' + _createIdString(station.getId()) + "/series";
                        var extParams = {expanded: true};
                        if (angular.isUndefined(params)) {
                            params = extParams;
                        } else {
                            angular.extend(params, extParams);
                        }
                    } else {
                        url = apiUrl + 'stations/' + _createIdString(station.getId());
                    }
                    return $q(function (resolve, reject) {
                        $http.get(url, _createRequestConfigs(params)).then(function (response) {
                            if (isV2) {
                                station.properties.timeseries = {};
                                angular.forEach(response.data.series, function (series) {
                                    station.properties.timeseries[series.id] = series.parameters;
                                });
                                resolve(station);
                            } else {
                                station.properties = response.data.properties;
                                resolve(station);
                            }
                        }, function (error) {
                            _errorCallback(error, reject);
                        });
                    });
                };

                this.getPhenomena = function (id, apiUrl, params) {
                    return $q(function (resolve, reject) {
                        $http.get(apiUrl + 'phenomena/' + _createIdString(id), _createRequestConfigs(params)).then(function (response) {
                            resolve(response.data);
                        }, function (error) {
                            _errorCallback(error, reject);
                        });
                    });
                };

                this.getCategories = function (id, apiUrl, params) {
                    return $q(function (resolve, reject) {
                        $http.get(apiUrl + 'categories/' + _createIdString(id), _createRequestConfigs(params)).then(function (response) {
                            resolve(response.data);
                        }, function (error) {
                            _errorCallback(error, reject);
                        });
                    });
                };

                this.getFeatures = function (id, apiUrl, params) {
                    return $q(function (resolve, reject) {
                        $http.get(apiUrl + 'features/' + _createIdString(id), _createRequestConfigs(params)).then(function (response) {
                            resolve(response.data);
                        }, function (error) {
                            _errorCallback(error, reject);
                        });
                    });
                };

                this.getProcedures = function (id, apiUrl, params) {
                    return $q(function (resolve, reject) {
                        $http.get(apiUrl + 'procedures/' + _createIdString(id), _createRequestConfigs(params)).then(function (response) {
                            resolve(response.data);
                        }, function (error) {
                            _errorCallback(error, reject);
                        });
                    });
                };

                this.search = function (apiUrl, arrayParams) {
                    return $q(function (resolve, reject) {
                        $http.get(apiUrl + 'search', _createRequestConfigs({
                            q: arrayParams.join(',')
                        })).then(function (response) {
                            resolve(response.data);
                        }, function (error) {
                            _errorCallback(error, reject);
                        });
                    });
                };

                this.getTimeseries = function (id, apiUrl, params) {
                    if (angular.isUndefined(params))
                        params = {};
                    var url, isV2 = _isV2(apiUrl);
                    if (isV2) {
                        url = apiUrl + 'series/' + _createIdString(id);
                    } else {
                        url = apiUrl + 'timeseries/' + _createIdString(id);
                    }
                    params.expanded = true;
                    params.force_latest_values = true;
                    params.status_intervals = true;
                    params.rendering_hints = true;
                    return $q(function (resolve, reject) {
                        $http.get(url, _createRequestConfigs(params)).then(function (response) {
                            if (isV2) {
                                var series = new Timeseries(utils.createInternalId(response.data.id, apiUrl), apiUrl);
                                angular.extend(series, response.data);
                                resolve(series);
                            } else {
                                if (angular.isArray(response.data)) {
                                    var array = [];
                                    angular.forEach(response.data, function (ts) {
                                        array.push(_pimpTs(ts, apiUrl));
                                    });
                                    resolve(array);
                                } else {
                                    var series = new Timeseries(utils.createInternalId(response.data.id, apiUrl), apiUrl);
                                    angular.extend(series, response.data);
                                    resolve(series);
                                }
                            }
                        }, function (error) {
                            _errorCallback(error, reject);
                        });
                    });
                };

                this.getTsData = function (id, apiUrl, timespan, extendedData) {
                    var requestUrl, isV2 = _isV2(apiUrl);
                    var params = {
                        timespan: timespan,
                        generalize: statusService.status.generalizeData || false,
                        expanded: true,
                        format: 'flot'
                    };
                    if (extendedData) {
                        angular.extend(params, extendedData);
                    }
                    if (isV2) {
                        requestUrl = apiUrl + 'series/' + _createIdString(id) + "/getData";
                    } else {
                        requestUrl = apiUrl + 'timeseries/' + _createIdString(id) + "/getData";
                    }
                    return $q(function (resolve, reject) {
                        $http.get(requestUrl, _createRequestConfigs(params)).then(function (response) {
                            resolve(response.data);
                        }, function (error) {
                            _errorCallback(error, reject);
                        });
                    });
                };
            }]);