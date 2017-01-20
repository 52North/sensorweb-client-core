(function() {
    'use strict';

    angular.module('n52.core.interface').service('seriesApiV1Interface', [
        '$http',
        '$log',
        'settingsService',
        'utils',
        'interfaceUtils',
        function($http, $log, settingsService, utils, interfaceUtils) {

            this.getServices = function(id, apiUrl, params) {

                var requestParams,
                    requestUrl = interfaceUtils.createRequestUrl(apiUrl, 'services/', id);

                params = this.extendParams(params, {
                    expanded: true
                });

                requestParams = interfaceUtils.createRequestConfigs(params);

                return interfaceUtils.requestSeriesApi(requestUrl, requestParams);
            };

            this.getStations = function(id, apiUrl, params) {

                var requestUrl = interfaceUtils.createRequestUrl(apiUrl, 'stations/', id),
                    requestParams = interfaceUtils.createRequestConfigs(params);

                return interfaceUtils.requestSeriesApi(requestUrl, requestParams);
            };

            this.getPhenomena = function(id, apiUrl, params) {

                var requestUrl = interfaceUtils.createRequestUrl(apiUrl, 'phenomena/', id),
                    requestParams = interfaceUtils.createRequestConfigs(params);

                return interfaceUtils.requestSeriesApi(requestUrl, requestParams);
            };


            this.getCategories = function(id, apiUrl, params) {

                var requestUrl = interfaceUtils.createRequestUrl(apiUrl, 'categories/', id),
                    requestParams = interfaceUtils.createRequestConfigs(params);

                return interfaceUtils.requestSeriesApi(requestUrl, requestParams);
            };

            this.getFeatures = function(id, apiUrl, params) {

                var requestUrl = interfaceUtils.createRequestUrl(apiUrl, 'features/', id),
                    requestParams = interfaceUtils.createRequestConfigs(params);

                return interfaceUtils.requestSeriesApi(requestUrl, requestParams);

            };

            this.getProcedures = function(id, apiUrl, params) {

                var requestUrl = interfaceUtils.createRequestUrl(apiUrl, 'procedures/', id),
                    requestParams = interfaceUtils.createRequestConfigs(params);

                return interfaceUtils.requestSeriesApi(requestUrl, requestParams);
            };

            this.getOfferings = function(id, apiUrl, params) {

                var requestUrl = interfaceUtils.createRequestUrl(apiUrl, 'offerings/', id),
                    requestParams = interfaceUtils.createRequestConfigs(params);

                return interfaceUtils.requestSeriesApi(requestUrl, requestParams);
            };

            this.search = function(apiUrl, arrayParams) {

                var requestUrl = apiUrl + 'search',
                    requestParams = interfaceUtils.createRequestConfigs({
                        q: arrayParams.join(',')
                    });

                return interfaceUtils.requestSeriesApi(requestUrl, requestParams);
            };

            this.getTimeseries = function(id, apiUrl, params) {

                var requestUrl = interfaceUtils.createRequestUrl(apiUrl, 'timeseries/', id),
                    requestParams = params || {};

                requestParams.expanded = true;
                requestParams.force_latest_values = true;
                requestParams.status_intervals = true;
                requestParams.rendering_hints = true;

                return $http.get(requestUrl, interfaceUtils.createRequestConfigs(requestParams))
                    .then(response => {
                            if (angular.isArray(response.data)) {
                                angular.forEach(response.data, ts => {
                                    ts.apiUrl = apiUrl;
                                });
                                return response.data;
                            } else {
                                response.data.apiUrl = apiUrl;
                                return response.data;
                            }
                        },
                        this.errorCallback
                    );
            };

            this.getTsData = function(id, apiUrl, timespan, extendedData, generalizeData) {

                var requestUrl = interfaceUtils.createRequestUrl(apiUrl, 'timeseries/', id) + "/getData",
                    requestParams, params = {
                        timespan: utils.createRequestTimespan(timespan.start, timespan.end),
                        generalize: generalizeData || false,
                        expanded: true,
                        format: 'flot'
                    };

                if (extendedData) {
                    angular.extend(params, extendedData);
                }
                requestParams = interfaceUtils.createRequestConfigs(params);

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
            }

            this.extendParams = function(params, extendParams) {
                if (!params) {
                    return extendParams;
                } else {
                    return angular.extend(params, extendParams);
                }
            };

        }
    ]);
}());
