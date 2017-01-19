(function () {
    'use strict';

    angular.module('n52.core.interface').service('seriesApiV1Interface', [
        '$http',
        '$log',
        'settingsService',
        'utils',
        function ($http, $log, settingsService, utils) {

            function createRequestUrl(apiUrl, endpoint, id) {

                // TODO Check whether apiUrl ends with slash                    
                var requestUrl = apiUrl + endpoint;

                if (id) {
                    requestUrl += id;
                }
                return requestUrl;
            }

            this.getServices = function (apiUrl, id, params) {

                var requestParams,
                        requestUrl = createRequestUrl(apiUrl, 'services/', id);

                params = this.extendParams(params, {
                    expanded: true
                });

                requestParams = this.createRequestConfigs(params);

                return this.requestSeriesApi(requestUrl, requestParams);
            };

            this.getStations = function (id, apiUrl, params) {

                var requestUrl = createRequestUrl(apiUrl, 'stations/', id),
                        requestParams = this.createRequestConfigs(params);

                return this.requestSeriesApi(requestUrl, requestParams);
            };

            this.getPhenomena = function (id, apiUrl, params) {

                var requestUrl = createRequestUrl(apiUrl, 'phenomena/', id),
                        requestParams = this.createRequestConfigs(params);

                return this.requestSeriesApi(requestUrl, requestParams);
            };


            this.getCategories = function (id, apiUrl, params) {

                var requestUrl = createRequestUrl(apiUrl, 'categories/', id),
                        requestParams = this.createRequestConfigs(params);

                return this.requestSeriesApi(requestUrl, requestParams);
            };

            this.getFeatures = function (id, apiUrl, params) {

                var requestUrl = createRequestUrl(apiUrl, 'features/', id),
                        requestParams = this.createRequestConfigs(params);

                return this.requestSeriesApi(requestUrl, requestParams);

            };

            this.getProcedures = function (id, apiUrl, params) {

                var requestUrl = createRequestUrl(apiUrl, 'procedures/', id),
                        requestParams = this.createRequestConfigs(params);

                return this.requestSeriesApi(requestUrl, requestParams);
            };

            this.getOfferings = function (id, apiUrl, params) {

                var requestUrl = createRequestUrl(apiUrl, 'offerings/', id),
                        requestParams = this.createRequestConfigs(params);

                return this.requestSeriesApi(requestUrl, requestParams);
            };

            this.search = function (apiUrl, arrayParams) {

                var requestUrl = apiUrl + 'search',
                        requestParams = this.createRequestConfigs({
                            q: arrayParams.join(',')
                        });

                return this.requestSeriesApi(requestUrl, requestParams);
            };

            this.getTimeseries = function (id, apiUrl, params) {

                var requestUrl = createRequestUrl(apiUrl, 'timeseries/', id),
                        requestParams = params || {};

                requestParams.expanded = true;
                requestParams.force_latest_values = true;
                requestParams.status_intervals = true;
                requestParams.rendering_hints = true;


                return this.requestSeriesApi(requestUrl, requestParams);
            };

            this.requestSeriesApi = function (requestUrl, params) {

                return $http.get(requestUrl, params)
                        .then(
                                response => {
                                    return response.data;
                                },
                                this.errorCallback
                                );
            };


            this.getTsData = function (id, apiUrl, timespan, extendedData, generalizeData) {

                var requestUrl = createRequestUrl(apiUrl, 'timeseries/', id) + "/getData",
                        params = {
                            timespan: utils.createRequestTimespan(timespan.start, timespan.end),
                            generalize: generalizeData || false,
                            expanded: true,
                            format: 'flot'
                        };

                if (extendedData) {
                    angular.extend(params, extendedData);
                }

                return $http.get(requestUrl, params)
                        .then(
                                response => {
                                    this.revampTimeseriesData(response.data, id);
                                    return response.data;
                                },
                                this.errorCallback
                                );
            };

            this.errorCallback = function (error, reject) {
                if (error.data && error.data.userMessage) {
                    $log.error(error.data.userMessage);
                }
                if (!angular.isUndefined(reject)) {
                    reject(error);
                }
            };

            this.revampTimeseriesData = function (data, id) {
                if (data[id].values.length > 0 && data[id].values[0].timestamp) {
                    var temp = [];
                    angular.forEach(data[id].values, entry => {
                        temp.push([entry.timestamp, entry.value]);
                    });
                    data[id].values = temp;
                }
            };

            this.extendParams = function (params, extendParams) {
                if (!params) {
                    return extendParams;
                } else {
                    return angular.extend(params, extendParams);
                }
            };

            this.createRequestConfigs = function (params) {

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


        }
    ]);
}());