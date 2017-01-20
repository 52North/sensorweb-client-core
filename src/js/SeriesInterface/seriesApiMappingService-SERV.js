(function() {
    'use strict';

    angular.module('n52.core.interface').service('seriesApiMappingService', [
        '$http',
        '$q',
        function($http, $q) {

            var serviceRootUrlToVersionMap = {},
                apiVersion = {
                    n52SeriesApiV1: 1,
                    n52seriesApiV2: 2
                };

            function detectApiVersion(apiUrl) {

                return $http.get(apiUrl).then(

                    function(response) {
                        if (response && response.data && !isNaN(response.data.length)) {
                            angular.forEach(response.data, function(entry) {
                                if (entry.id === 'platforms') {
                                    return apiVersion.n52seriesApiV2;
                                }
                            });
                            return apiVersion.n52SeriesApiV1;
                        }
                    });
            }

            function getApiVersion(apiUrl) {

                return $q(function(resolve, reject) {

                    if (serviceRootUrlToVersionMap[apiUrl]) {

                        resolve(serviceRootUrlToVersionMap[apiUrl]);

                    } else {

                        detectApiVersion(apiUrl).then(

                            function(apiVersion) {
                                resolve(apiVersion);
                            });
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
