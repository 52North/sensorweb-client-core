(function() {
    'use strict';

    angular.module('n52.core.interface').service('seriesApiV2Interface', [
        'seriesApiV1Interface',
        'utils',
        'interfaceUtils',
        function(seriesApiV1Interface, utils, interfaceUtils) {

            function addAllPlatformTypes(params) {
                if (params && !params.platformTypes)
                    params.platformTypes = 'all';
                return params;
            }

            function adjustTs(ts, url) {
                ts.apiUrl = url;
                ts.properties = {
                    id: ts.id
                };
                ts.parameters = ts.seriesParameters;
            }

            this.getPlatforms = function(id, apiUrl, params) {
                var requestUrl = interfaceUtils.createRequestUrl(apiUrl, 'platforms/', id),
                    requestParams = interfaceUtils.createRequestConfigs(params);
                return interfaceUtils.requestSeriesApi(requestUrl, requestParams);
            };

            this.getStationaryPlatforms = function(id, apiUrl, params) {
                params = seriesApiV1Interface.extendParams(params, {
                    platformTypes: 'stationary'
                });
                return this.getPlatforms(id, apiUrl, params);
            };

            this.getPlatformExtras = function(id, apiUrl, params) {
                var requestUrl = interfaceUtils.createRequestUrl(apiUrl, 'platforms/', id) + '/extras',
                    requestParams = interfaceUtils.createRequestConfigs(params);
                return interfaceUtils.requestSeriesApi(requestUrl, requestParams);
            };

            this.getServices = function(id, apiUrl, params) {
                return seriesApiV1Interface.getServices(id, apiUrl, params);
            };

            this.getStations = function(id, apiUrl, params) {
                params = seriesApiV1Interface.extendParams(params, {
                    expanded: true
                });
                return this.getStationaryPlatforms(id, apiUrl, params)
                    .then(function(response) {
                        if (isNaN(response.length)) {
                            response.properties = {
                                id: response.id,
                                timeseries: response.datasets
                            };
                        } else {
                            angular.forEach(response, function(entry) {
                                entry.properties = {
                                    id: entry.id,
                                    timeseries: entry.datasets
                                };
                            });
                        }
                        return response;
                    });
            };

            this.getPhenomena = function(id, apiUrl, params) {
                addAllPlatformTypes(params);
                return seriesApiV1Interface.getPhenomena(id, apiUrl, params);
            };

            this.getCategories = function(id, apiUrl, params) {
                addAllPlatformTypes(params);
                return seriesApiV1Interface.getCategories(id, apiUrl, params);
            };

            this.getFeatures = function(id, apiUrl, params) {
                addAllPlatformTypes(params);
                return seriesApiV1Interface.getFeatures(id, apiUrl, params);
            };

            this.getProcedures = function(id, apiUrl, params) {
                addAllPlatformTypes(params);
                return seriesApiV1Interface.getProcedures(id, apiUrl, params);
            };

            this.getOfferings = function(id, apiUrl, params) {
                addAllPlatformTypes(params);
                return seriesApiV1Interface.getOfferings(id, apiUrl, params);
            };

            this.search = function(apiUrl, arrayParams) {
                return seriesApiV1Interface.search(apiUrl, arrayParams);
            };

            this.getTimeseries = function(id, apiUrl, params) {
                var requestParams = params || {};

                requestParams.expanded = true;
                requestParams.force_latest_values = true;
                requestParams.status_intervals = true;
                requestParams.rendering_hints = true;

                return this.getDatasets(id, apiUrl, interfaceUtils.createRequestConfigs(params))
                    .then(

                        function(response) {
                            if (isNaN(response.length)) {
                                adjustTs(response, apiUrl);

                            } else {
                                angular.forEach(response, function(entry) {
                                    adjustTs(entry, apiUrl);
                                });
                            }
                            return response;
                        });
            };

            this.getExtras = function(tsId, apiUrl, params) {
                var requestUrl = interfaceUtils.createRequestUrl(apiUrl, 'timeseries/', tsId) + '/extras',
                    requestParams = interfaceUtils.createRequestConfigs(params);

                return interfaceUtils.requestSeriesApi(requestUrl, requestParams);
            };

            this.getTsData = function(id, apiUrl, timespan, extendedData, generalizeData, expanded) {
                var params = {
                    timespan: utils.createRequestTimespan(timespan.start, timespan.end),
                    generalize: generalizeData || false,
                    expanded: true,
                    format: 'flot'
                };
                if (extendedData) {
                    angular.extend(params, extendedData);
                }

                if (!angular.isUndefined(expanded)) {
                    params.expanded = expanded;
                }

                return this.getDatasetData(id, apiUrl, timespan, params)
                    .then(

                        function(response) {
                            return response;
                        },
                        interfaceUtils.errorCallback
                    );

            };

            this.getDatasets = function(id, apiUrl, params) {
                var requestUrl = interfaceUtils.createRequestUrl(apiUrl, 'datasets/', id),
                    requestParams = interfaceUtils.createRequestConfigs(params);
                return interfaceUtils.requestSeriesApi(requestUrl, requestParams);
            };

            this.getDatasetExtras = function(id, apiUrl, params) {
                var requestUrl = interfaceUtils.createRequestUrl(apiUrl, 'datasets/', id) + '/extras',
                    requestParams = interfaceUtils.createRequestConfigs(params);
                return interfaceUtils.requestSeriesApi(requestUrl, requestParams);
            };

            this.getDatasetData = function(id, apiUrl, timespan, extendedParams) {
                var requestParams = {},
                    requestUrl = interfaceUtils.createRequestUrl(apiUrl, 'datasets/', id) + '/data';

                if (timespan) {
                    requestParams.timespan = utils.createRequestTimespan(timespan.start, timespan.end);
                }
                if (extendedParams) {
                    angular.extend(requestParams, extendedParams);
                }
                return interfaceUtils.requestSeriesApi(requestUrl, interfaceUtils.createRequestConfigs(requestParams));
            };
        }
    ]);
}());
