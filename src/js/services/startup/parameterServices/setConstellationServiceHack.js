angular.module('n52.core.startup')
        .service('SetConstellationServiceHack', ['permalinkEvaluationService', '$log', 'settingsService', 'seriesApiInterface', 'timeseriesService',
            function (permalinkEvaluationService, $log, settingsService, seriesApiInterface, timeseriesService) {
                var featuresParam = 'features', proceduresParam = 'procedures', phenomenaParam = 'phenomena';
                createConstellationParameterArray = function () {
                    var constellations = [];
                    var features = permalinkEvaluationService.getParameterArray(featuresParam);
                    var procedures = permalinkEvaluationService.getParameterArray(proceduresParam);
                    var phenomena = permalinkEvaluationService.getParameterArray(phenomenaParam);
                    if (features && procedures && phenomena) {
                        if ((features.length === procedures.length) &&
                                (features.length === phenomena.length)) {
                            for (i = 0; i < features.length; i++) {
                                var constellation = [];
                                constellation.push(features[i]);
                                constellation.push(procedures[i]);
                                constellation.push(phenomena[i]);
                                constellations.push(constellation);
                            }
                        } else {
                            $log.warn('The Permalink consists of a wrong combination.');
                        }
                    }
                    return constellations;
                };
                this.setsParameters = function () {
                    var constellations = createConstellationParameterArray();
                    if (constellations.length > 0) {
                        var requestLength = 0;
                        var foundTimeseriesId;
                        angular.forEach(settingsService.restApiUrls, function (serviceId, url) {
                            angular.forEach(constellations, function (constellation) {
                                requestLength++;
                                seriesApiInterface.search(url, constellation).then(function (result) {
                                    if (result.length > 0) {
                                        var timeseries = [];
                                        angular.forEach(result, function (entry) {
                                            if (entry.type === 'timeseries')
                                                timeseries.push(entry);
                                        });

                                        if (angular.isObject(timeseries[0])) {
                                            foundTimeseriesId = timeseries[0].id;
                                            timeseriesService.addTimeseriesById(foundTimeseriesId, url);
                                        }
                                    }
                                    requestLength--;
                                    if (requestLength === 0) {
                                        if ($.isEmptyObject(foundTimeseriesId)) {
                                            $log.warn('No timeseries for this combinations are found.');
                                        }
                                    }
                                });
                            });
                        });
                    }
                };
            }]);
