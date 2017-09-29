(function() {
    'use strict';

    angular.module('n52.core.interface')
        .service('interfaceUtils', ['settingsService', '$http', '$log', '$q',
            function(settingsService, $http, $log, $q) {

                this.createRequestUrl = function(apiUrl, endpoint, id) {

                    // TODO Check whether apiUrl ends with slash
                    var requestUrl = apiUrl + endpoint;

                    if (id) {
                        requestUrl += id;
                    }
                    return requestUrl;
                };

                this.createRequestConfigs = function(params) {
                    if (angular.isUndefined(params) || params === null) {
                        params = settingsService.additionalParameters;
                    } else {
                        angular.extend(params, settingsService.additionalParameters);
                    }
                    if (!params.platformTypes) {
                        params.platformTypes = 'all';
                    }
                    var cache = true;
                    if (typeof(params.cache) === "boolean") {
                        cache = params.cache;
                        delete params.cache;
                    }
                    return {
                        params: params,
                        cache: cache
                    };
                };

                this.requestSeriesApi = function(requestUrl, params) {
                    return $q((resolve, reject) => {
                        $http.get(requestUrl, params)
                            .then(
                                response => resolve(response.data),
                                error => this.errorCallback(error, reject)
                            );
                    });
                };

                this.errorCallback = function(error, reject) {
                    if (error.data && error.data.userMessage) {
                        $log.error(error.data.userMessage);
                    }
                    if (!angular.isUndefined(reject)) {
                        reject(error);
                    }
                };

                this.revampTimeseriesData = function(data, id) {
                    var temp = [];
                    if (data[id] &&
                        data[id].values &&
                        data[id].values.length > 0 &&
                        data[id].values[0].timestamp) {
                        angular.forEach(data[id].values, entry => {
                            temp.push([entry.timestamp, entry.value]);
                        });
                        data[id].values = temp;
                    }
                    if (data &&
                        data.values &&
                        data.values.length > 0 &&
                        data.values[0].timestamp) {
                        angular.forEach(data.values, entry => {
                            temp.push([entry.timestamp, entry.value]);
                        });
                        data.values = temp;
                    }
                };

            }
        ]);
}());
