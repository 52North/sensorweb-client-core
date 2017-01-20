(function() {
    'use strict';

    angular.module('n52.core.interface').service('seriesApiV1Interface', [
        '$http',
        '$log',
        'settingsService',
        'utils',
        function($http, $log, settingsService, utils) {

            function createRequestUrl(apiUrl, endpoint, id) {

                // TODO Check whether apiUrl ends with slash
                var requestUrl = apiUrl + endpoint;

                if (id) {
                    requestUrl += id;
                }
                return requestUrl;
            }

            this.getServices = function(id, apiUrl, params) {

                var requestParams,
                    requestUrl = createRequestUrl(apiUrl, 'services/', id);

                params = this.extendParams(params, {
                    expanded: true
                });

                requestParams = createRequestConfigs(params);

                return this.requestSeriesApi(requestUrl, requestParams);
            };

            this.getStations = function(id, apiUrl, params) {

                var requestUrl = createRequestUrl(apiUrl, 'stations/', id),
                    requestParams = createRequestConfigs(params);

                return this.requestSeriesApi(requestUrl, requestParams);
            };

            this.getPhenomena = function(id, apiUrl, params) {

                var requestUrl = createRequestUrl(apiUrl, 'phenomena/', id),
                    requestParams = createRequestConfigs(params);

                return this.requestSeriesApi(requestUrl, requestParams);
            };


            this.getCategories = function(id, apiUrl, params) {

                var requestUrl = createRequestUrl(apiUrl, 'categories/', id),
                    requestParams = createRequestConfigs(params);

                return this.requestSeriesApi(requestUrl, requestParams);
            };

            this.getFeatures = function(id, apiUrl, params) {

                var requestUrl = createRequestUrl(apiUrl, 'features/', id),
                    requestParams = createRequestConfigs(params);

                return this.requestSeriesApi(requestUrl, requestParams);

            };

            this.getProcedures = function(id, apiUrl, params) {

                var requestUrl = createRequestUrl(apiUrl, 'procedures/', id),
                    requestParams = createRequestConfigs(params);

                return this.requestSeriesApi(requestUrl, requestParams);
            };

            this.getOfferings = function(id, apiUrl, params) {

                var requestUrl = createRequestUrl(apiUrl, 'offerings/', id),
                    requestParams = createRequestConfigs(params);

                return this.requestSeriesApi(requestUrl, requestParams);
            };

            this.search = function(apiUrl, arrayParams) {

                var requestUrl = apiUrl + 'search',
                    requestParams = createRequestConfigs({
                        q: arrayParams.join(',')
                    });

                return this.requestSeriesApi(requestUrl, requestParams);
            };

            this.getTimeseries = function(id, apiUrl, params) {

                var requestUrl = createRequestUrl(apiUrl, 'timeseries/', id),
                    requestParams = params || {};

                requestParams.expanded = true;
                requestParams.force_latest_values = true;
                requestParams.status_intervals = true;
                requestParams.rendering_hints = true;


                return this.requestSeriesApi(requestUrl, requestParams);
            };

            this.requestSeriesApi = function(requestUrl, params) {


                return $http.get(requestUrl, params)
                    .then(function(response) {
                            return response.data;
                        },
                        this.errorCallback
                    );
            };


            this.getTsData = function(id, apiUrl, timespan, extendedData, generalizeData) {

                var requestUrl = createRequestUrl(apiUrl, 'timeseries/', id) + "/getData",
                    requestParams, params = {
                        timespan: utils.createRequestTimespan(timespan.start, timespan.end),
                        generalize: generalizeData || false,
                        expanded: true,
                        format: 'flot'
                    };

                if (extendedData) {
                    angular.extend(params, extendedData);
                }
                requestParams = createRequestConfigs(params);

                return $http.get(requestUrl, requestParams)
                    .then(

                        function(response) {
                            console.log(response);
                            revampTimeseriesData(response.data, id);
                            return response.data;
                        },
                        this.errorCallback
                    );
            };

            this.errorCallback = function(error, reject) {
                if (error.data && error.data.userMessage) {
                    $log.error(error.data.userMessage);
                }
                if (!angular.isUndefined(reject)) {
                    reject(error);
                }
            };

            function revampTimeseriesData(data, id) {
                if (data[id].values.length > 0 && data[id].values[0].timestamp) {
                    var temp = [];
                    angular.forEach(data[id].values,
                        function(entry) {
                            temp.push([entry.timestamp, entry.value]);
                        }
                    );
                    data[id].values = temp;
                }
            };

            this.extendParams = function(params, extendParams) {
                if (!params) {
                    return extendParams;
                } else {
                    return angular.extend(params, extendParams);
                }
            };

            function createRequestConfigs(params) {

                if (angular.isUndefined(params)) {
                    params = settingsService.additionalParameters;
                } else {
                    angular.extend(params, settingsService.additionalParameters);
                }

                return {
                    params: params,
                    cache: true
                };
            }

        }
    ]);
}());
