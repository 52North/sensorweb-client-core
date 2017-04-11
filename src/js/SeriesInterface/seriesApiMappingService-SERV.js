(function() {
    'use strict';

    angular.module('n52.core.interface').service('seriesApiMappingService', [
        '$http',
        '$q',
        function($http, $q) {

            var serviceRootUrlToVersionMap = {},
                apiVersion = {
                    n52SeriesApiV1: 1,
                    n52SeriesApiV2: 2
                };

            function detectApiVersion(apiUrl) {
                return $http.get(apiUrl, {
                    cache: true
                }).then(
                    function(response) {
                        if (response && response.data && !isNaN(response.data.length)) {
                            var version = apiVersion.n52SeriesApiV1;
                            angular.forEach(response.data, function(entry) {
                                if (entry.id === 'platforms') {
                                    version = apiVersion.n52SeriesApiV2;
                                }
                            });
                            return version;
                        }
                    }
                );
            }

            function getApiVersion(apiUrl) {
                return $q(function(resolve) {
                    if (serviceRootUrlToVersionMap[apiUrl]) {
                        resolve(serviceRootUrlToVersionMap[apiUrl]);
                    } else {
                        detectApiVersion(apiUrl).then(
                            function(apiVersion) {
                                resolve(apiVersion);
                            }
                        );
                    }
                });
            }

            return {
                getApiVersion: getApiVersion,
                apiVersion: apiVersion
            };
        }
    ]);
}());
