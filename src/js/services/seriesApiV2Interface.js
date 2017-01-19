(function () {
    'use strict';

    angular.module('n52.core.interface').service('seriesApiV2Interface', [
        'seriesApiV1Interface',
        'utils',
        function (seriesApiV1Interface, utils) {

            function addAllPlatformTypes(params) {
                if (params && !params.platformTypes)
                    params.platformTypes = 'all';
                return params;
            }

            function adjustTs(ts, url) {
                ts.properties = {
                    id: ts.id
                };
                ts.parameters = ts.seriesParameters;
            }

            this.getPlatforms = function (id, apiUrl, params) {

                var requestUrl = createRequestUrl(apiUrl, 'platforms/', id),
                        requestParams = seriesApiV1Interface.createRequestConfigs(params);

                return seriesApiV1Interface.requestSeriesApi(requestUrl, requestParams);
            };

            this.getStationaryPlatforms = function (id, apiUrl, params) {

                params = seriesApiV1Interface.extendParams(params, {
                    platformTypes: 'stationary'
                });

                return this.getPlatforms(id, apiUrl, params);
            };

            this.getServices = function (apiUrl, id, params) {

                return seriesApiV1Interface.getServices(apiUrl, id, params);
            };

            this.getStations = function (id, apiUrl, params) {

                params = seriesApiV1Interface.extendParams(params, {
                    expanded: true
                });

                return this.getStationaryPlatforms(id, apiUrl, params)
                        .then(response => {
                            if (isNaN(response.length)) {
                                response.properties = {
                                    id: response.id,
                                    timeseries: response.datasets
                                };
                            } else {
                                response.forEach(entry => {
                                    entry.properties = {
                                        id: entry.id,
                                        timeseries: entry.datasets
                                    };
                                });
                            }
                            return response;
                        });
            };

            this.getPhenomena = function (id, apiUrl, params) {

                addAllPlatformTypes(params);

                return seriesApiV1Interface.getPhenomena(apiUrl, id, params);
            };

            this.getCategories = function (id, apiUrl, params) {

                addAllPlatformTypes(params);

                return seriesApiV1Interface.getCategories(apiUrl, id, params);
            };

            this.getFeatures = function (id, apiUrl, params) {

                addAllPlatformTypes(params);

                return seriesApiV1Interface.getFeatures(apiUrl, id, params);
            };

            this.getProcedures = function (id, apiUrl, params) {

                addAllPlatformTypes(params);

                return seriesApiV1Interface.getProcedures(apiUrl, id, params);
            };

            this.getOfferings = function (id, apiUrl, params) {

                addAllPlatformTypes(params);

                return seriesApiV1Interface.getOfferings(apiUrl, id, params);
            };

            this.search = function (apiUrl, arrayParams) {

                return seriesApiV1Interface.search(apiUrl, arrayParams);
            };

            this.getTimeseries = function (id, apiUrl, params) {

                var requestParams = params || {};

                requestParams.expanded = true;
                requestParams.force_latest_values = true;
                requestParams.status_intervals = true;
                requestParams.rendering_hints = true;

                return  this.getDatasets(id, apiUrl, params)
                        .then(
                                response => {
                                    if (isNaN(response.length)) {
                                        adjustTs(response, apiUrl);

                                    } else {
                                        response.forEach(entry => {
                                            adjustTs(entry, apiUrl);
                                        });
                                    }
                                    return response;
                                });
            };

            this.getExtras = function (tsId, apiUrl, params) {

                var requestUrl = createRequestUrl(apiUrl, 'timeseries/', tsId) + '/extras',
                        requestParams = seriesApiV1Interface.createRequestConfigs(params);

                return seriesApiV1Interface.requestSeriesApi(requestUrl, requestParams);
            };

            this.getTsData = function (id, apiUrl, timespan, extendedData, generalizeData) {
                var params = {
                    timespan: utils.createRequestTimespan(timespan.start, timespan.end),
                    generalize: generalizeData || false,
                    expanded: true,
                    format: 'flot'
                };
                if (extendedData) {
                    angular.extend(params, extendedData);
                }
                return this.getDatasetData(id, apiUrl, timespan, params)
                        .then(
                                response => {
                                    return response;
                                },
                                seriesApiV1Interface.errorCallback
                                );

            };

            this.getDatasets = function (id, apiUrl, params) {

                var requestUrl = createRequestUrl(apiUrl, 'datasets/', id),
                        requestParams = seriesApiV1Interface.createRequestConfigs(params);

                return seriesApiV1Interface.requestSeriesApi(requestUrl, requestParams);
            };

            this.getDatasetData = function (id, apiUrl, timespan, extendedParams) {

                var requestParams = {
                    timespan: utils.createRequestTimespan(timespan.start, timespan.end)
                },
                        requestUrl = createRequestUrl(apiUrl, 'timeseries/', id) + '/data';

                if (extendedParams) {
                    angular.extend(requestParams, extendedParams);
                }

                return seriesApiV1Interface.requestSeriesApi(requestUrl, requestParams);
            };
        }
    ]);
}());