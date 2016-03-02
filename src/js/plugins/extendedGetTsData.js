// this extension splits one getData request in a couple of requests if the supported timespan is to great 
angular.module('n52.core.interface')
        .config(['$provide',
            function ($provide) {
                $provide.decorator('interfaceService', ['$delegate', '$q', 'statusService', '$http', 'settingsService', 'utils',
                    function ($delegate, $q, statusService, $http, settingsService, utils) {
                        var maxTimeExtent = moment.duration(365, 'day'), promises;

                        var _createRequestConfigs = function (params) {
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

                        $delegate.getTsData = function (id, apiUrl, timespan, extendedData) {
                            var params = {
                                generalize: statusService.status.generalizeData || false,
                                expanded: true,
                                format: 'flot'
                            };
                            if (extendedData) {
                                angular.extend(params, extendedData);
                            }

                            if ((timespan.end - timespan.start) > maxTimeExtent.asMilliseconds()) {
                                promises = [];
                                var start = moment(timespan.start);
                                while (start.isBefore(moment(timespan.end))) {
                                    var step = moment(start).add(maxTimeExtent);
                                    var promise = $delegate.getTsData(id, apiUrl, {start: start, end: step}, extendedData);
                                    promises.push(promise);
                                    start = step;
                                }
                                return $q(function (resolve, reject) {
                                    $q.all(promises).then(function (results) {
                                        var data = results[0];
                                        for (var i = 1; i < results.length; i++) {
                                            data[id].values = data[id].values.concat(results[i][id].values);
                                        }
                                        resolve(data);
                                    });
                                });
                            } else {
                                params.timespan = utils.createRequestTimespan(timespan.start, timespan.end);
                                return $q(function (resolve, reject) {
                                    $http.get(apiUrl + 'timeseries/' + _createIdString(id) + "/getData", _createRequestConfigs(params)).then(function (response) {
                                        resolve(response.data);
                                    }, function (error) {
                                        _errorCallback(error, reject);
                                    });
                                });
                            }
                        };

                        return $delegate;
                    }]);
            }]);