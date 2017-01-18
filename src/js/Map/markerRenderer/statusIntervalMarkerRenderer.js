angular.module('n52.core.map')
        .factory('statusIntervalMarkerRenderer', ['seriesApiInterface', 'statusService', 'settingsService', 'markerRendererHelper',
            function (seriesApiInterface, statusService, settingsService, markerRendererHelper) {
                var fieldName = 'statusIntervals';

                var addMarker = function (params) {
                    if (statusService.status.concentrationMarker && isTimeseries(params.element)) {
                        if (params.element[fieldName]) {
                            var interval = getMatchingInterval(params.element.lastValue, params.element[fieldName]);
                            addIntervalMarker(params, interval);
                            return true;
                        } else {
                            if (params.element.extras && params.element.extras.indexOf(fieldName) > -1) {
                                seriesApiInterface.getExtras(params.element.id, params.serviceUrl, {field: fieldName})
                                        .then(function (result) {
                                            var interval = getMatchingInterval(params.element.lastValue, result[fieldName]);
                                            addIntervalMarker(params, interval);
                                        });
                                return true;
                            }
                        }
                    }
                    return false;
                };

                var addIntervalMarker = function (params, interval) {
                    var fillcolor = interval && interval.color ? interval.color : settingsService.defaultMarkerColor;
                    params.map.paths[markerRendererHelper.getStationId()] = {
                        type: "circleMarker",
                        latlngs: {
                            lat: params.geometry[1],
                            lng: params.geometry[0]
                        },
                        color: '#000',
                        fillColor: fillcolor,
                        fill: true,
                        radius: 10,
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.8,
                        stationsId: params.element.station.properties.id,
                        url: params.serviceUrl
                    };
                };

                var getMatchingInterval = function (lastValue, statusIntervals) {
                    var matchedInterval = null;
                    if (lastValue && statusIntervals) {
                        var value = lastValue.value;
                        angular.forEach(statusIntervals, function (interval) {
                            if (interval.upper === null) {
                                interval.upper = Number.MAX_VALUE;
                            }
                            if (interval.lower === null) {
                                interval.lower = Number.MIN_VALUE;
                            }
                            if (!isNaN(interval.upper) && !isNaN(interval.lower) && parseFloat(interval.lower) < value && value < parseFloat(interval.upper)) {
                                matchedInterval = interval;
                                return false;
                            }
                        });
                    }
                    return matchedInterval;
                };

                var isTimeseries = function (elem) {
                    return angular.isDefined(elem.station);
                };

                var needsTimeseriesRequested = function() {
                    return statusService.status.concentrationMarker;
                };

                return {
                    needsTimeseriesRequested: needsTimeseriesRequested,
                    addMarker: addMarker
                };
            }]);
