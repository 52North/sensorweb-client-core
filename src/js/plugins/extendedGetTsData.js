// this extension splits one getData request in a couple of requests if the supported timespan is to great
angular.module('n52.core.interface')
    .config(['$provide',
        function($provide) {
            $provide.decorator('seriesApiInterface', ['$delegate', '$q', '$http', 'utils',
                function($delegate, $q, $http, utils) {
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
                            return $q((resolve) => {
                                $q.all(promises).then((results) => {
                                    const mergedResult = results.reduce((previous, current) => {
                                        const next = {};
                                        next[id] = {
                                            referenceValues: {},
                                            values: []
                                        };

                                        if (previous[id].values && current[id].values) {
                                            next[id].values = previous[id].values.concat(current[id].values);
                                        }

                                        if (previous[id].valueBeforeTimespan) {
                                            next[id].valueBeforeTimespan = previous[id].valueBeforeTimespan;
                                        }

                                        if (current[id].valueAfterTimespan) {
                                            next[id].valueAfterTimespan = current[id].valueAfterTimespan;
                                        }

                                        for (let key in previous[id].referenceValues) {
                                            if (previous[id].referenceValues.hasOwnProperty(key) && current[id].referenceValues.hasOwnProperty(key)) {
                                                const refVal = previous[id].referenceValues[key];
                                                if (refVal instanceof Array) {
                                                    next[id].referenceValues[key] = refVal.concat(current[id].referenceValues[key]);
                                                } else {
                                                    const currRefValData = (current[id].referenceValues[key]) ;
                                                    const prevRefValData = (refVal);
                                                    const nextRefValData = {
                                                        referenceValues: {},
                                                        values: []
                                                    };
                                                    if (prevRefValData.values && currRefValData.values) {
                                                        nextRefValData.values = prevRefValData.values.concat(currRefValData.values);
                                                    }
                                                    if (prevRefValData.valueBeforeTimespan) {
                                                        nextRefValData.valueBeforeTimespan = prevRefValData.valueBeforeTimespan;
                                                    }
                                                    if (currRefValData.valueAfterTimespan) {
                                                        nextRefValData.valueAfterTimespan = currRefValData.valueAfterTimespan;
                                                    }
                                                    next[id].referenceValues[key] = nextRefValData;
                                                }
                                            }
                                        }
                                        return next;
                                    });
                                    if (mergedResult[id].values && mergedResult[id].values.length > 0) {
                                        // cut first
                                        const fromIdx = mergedResult[id].values.findIndex(el => el[0] >= timespan.start);
                                        mergedResult[id].values = mergedResult[id].values.slice(fromIdx);
                                        // cut last
                                        const toIdx = mergedResult[id].values.findIndex(el => el[0] >= timespan.end);
                                        if (toIdx >= 0) {
                                            mergedResult[id].values = mergedResult[id].values.slice(0, toIdx + 1);
                                        }
                                    }
                                    resolve(mergedResult);
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
