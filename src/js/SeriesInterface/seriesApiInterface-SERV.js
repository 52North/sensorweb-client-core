(function () {
    'use strict';

    angular.module('n52.core.interface').service('seriesApiInterface', [
        "seriesApiMappingService",
        "seriesApiV1Interface",
        "seriesApiV2Interface",
        function (seriesApiMappingService, seriesApiV1Interface, seriesApiV2Interface) {

            this.getPlatforms = function (id, apiUrl, params) {

                return seriesApiV2Interface.getPlatforms(id, apiUrl, params);
            };

            this.getStationaryPlatforms = function (id, apiUrl, params) {

                return seriesApiV2Interface.getStationaryPlatforms(id, apiUrl, params);
            };

            this.getServices = function (apiUrl, id, params) {

                return seriesApiV2Interface.getServices(id, apiUrl, params);
            };

            this.getStations = function (id, apiUrl, params) {

                return seriesApiMappingService.getApiVersion(apiUrl).then(
                        function(apiVersionId) {

                            if (apiVersionId === seriesApiMappingService.apiVersion.n52SeriesApiV2) {
                                return  seriesApiV2Interface.getStations(id, apiUrl, params);

                            } else if (apiVersionId === seriesApiMappingService.apiVersion.n52SeriesApiV1) {
                                return  seriesApiV1Interface.getStations(id, apiUrl, params);
                            }
                        }
                );
            };

            this.getPhenomena = function (id, apiUrl, params) {

                return seriesApiV2Interface.getPhenomena(id, apiUrl, params);
            };

            this.getCategories = function (id, apiUrl, params) {

                return seriesApiV2Interface.getCategories(id, apiUrl, params);
            };

            this.getFeatures = function (id, apiUrl, params) {

                return seriesApiV2Interface.getFeatures(id, apiUrl, params);
            };

            this.getProcedures = function (id, apiUrl, params) {

                return seriesApiV2Interface.getProcedures(id, apiUrl, params);
            };

            this.getOfferings = function (id, apiUrl, params) {

                return seriesApiV2Interface.getOfferings(id, apiUrl, params);
            };

            this.search = function (apiUrl, arrayParams) {
                return seriesApiV2Interface.search(apiUrl, arrayParams);
            };

            this.getTimeseries = function (id, apiUrl, params) {
                return seriesApiMappingService.getApiVersion(apiUrl).then(
                        function(apiVersionId) {
                            
                            if (apiVersionId === seriesApiMappingService.apiVersion.n52SeriesApiV2) {
                                return  seriesApiV2Interface.getTimeseries(id, apiUrl, params);

                            } else if (apiVersionId === seriesApiMappingService.apiVersion.n52SeriesApiV1) {
                                return  seriesApiV1Interface.getTimeseries(id, apiUrl, params);
                            }
                        }
                );
            };

            this.getExtras = function (tsId, apiUrl, params) {

                return seriesApiV2Interface.getExtras(tsId, apiUrl, params);
            };

            this.getTsData = function (id, apiUrl, timespan, extendedData, generalizeData) {

                return seriesApiMappingService.getApiVersion(apiUrl).then(
                       function( apiVersionId) {

                            if (apiVersionId === seriesApiMappingService.apiVersion.n52SeriesApiV2) {
                                return  seriesApiV2Interface.getTsData(id, apiUrl, timespan, extendedData, generalizeData);

                            } else if (apiVersionId === seriesApiMappingService.apiVersion.n52SeriesApiV1) {
                                return  seriesApiV1Interface.getTsData(id, apiUrl, timespan, extendedData, generalizeData);
                            }
                        }
                );
            };

            this.getDatasets = function (id, apiUrl, params) {

                return seriesApiV2Interface.getDatasets(id, apiUrl, params);
            };

            this.getDatasetData = function (id, apiUrl, timespan, extendedParams) {

                return seriesApiV2Interface.getDatasetData(id, apiUrl, timespan, extendedParams);
            };

        }
    ]);

}());