// this extension splits one getData request in a couple of requests if the supported timespan is to great
angular.module('n52.core.interface')
    .config(['$provide',
        function($provide) {
            $provide.decorator('seriesApiInterface', ['$delegate', '$q', '$http', 'interfaceUtils', 'utils',
                function($delegate, $q, $http, interfaceUtils, utils) {
                    var maxTimeExtent = moment.duration(365, 'day'),
                        promises;

                    $delegate.oldGetTsData = $delegate.getTsData;

                    $delegate.getTsData = function(id, apiUrl, timespan, extendedData, generalizeData) {
                        var params = {
                            generalize: generalizeData || false,
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
                                var promise = $delegate.getTsData(id, apiUrl, {
                                    start: start,
                                    end: step
                                }, extendedData, generalizeData);
                                promises.push(promise);
                                start = step;
                            }
                            return $q((resolve, reject) => {
                                $q.all(promises).then((results) => {
                                    var data = results[0];
                                    for (var i = 1; i < results.length; i++) {
                                        data[id].values = data[id].values.concat(results[i][id].values);
                                    }
                                    resolve(data);
                                });
                            });
                        } else {
                            params.timespan = utils.createRequestTimespan(timespan.start, timespan.end);
                            return $delegate.oldGetTsData(id, apiUrl, timespan, params);
                        }
                    };

                    return $delegate;
                }
            ]);
        }
    ]);
