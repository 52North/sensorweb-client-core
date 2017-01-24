(function () {
    'use strict';

    angular.module('n52.core.interface')
            .service('interfaceUtils', ['settingsService', '$http', "$log",
                function (settingsService, $http, $log) {

                    var that = this;

                    this.createRequestUrl = function (apiUrl, endpoint, id) {
                        
                        // TODO Check whether apiUrl ends with slash
                        var requestUrl = apiUrl + endpoint;

                        if (id) {
                            requestUrl += id;
                        }
                        return requestUrl;
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

                    this.requestSeriesApi = function (requestUrl, params) {
                        return $http.get(requestUrl, params)
                                .then(
                                        function (response) {
                                            return response.data;
                                        },
                                        that.errorCallback
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

                }
            ]);
}());
