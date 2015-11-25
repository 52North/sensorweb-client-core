angular.module('n52.core.startup')
        .service('SetConstellationService', ['permalinkEvaluationService', '$log', 'settingsService', 'interfaceService', 'timeseriesService',
            function (permalinkEvaluationService, $log, settingsService, interfaceService, timeseriesService) {
                var servicesParam = 'services',
                        featuresParam = 'features',
                        offeringsParam = 'offerings',
                        proceduresParam = 'procedures',
                        phenomenaParam = 'phenomena';
                createConstellationParameterArray = function () {
                    var constellations = [];
                    var services = permalinkEvaluationService.getParameterArray(servicesParam);
                    var features = permalinkEvaluationService.getParameterArray(featuresParam);
                    var offerings = permalinkEvaluationService.getParameterArray(offeringsParam);
                    var procedures = permalinkEvaluationService.getParameterArray(proceduresParam);
                    var phenomena = permalinkEvaluationService.getParameterArray(phenomenaParam);
                    if (services && features && offerings && procedures && phenomena) {
                        if ((services.length === features.length) &&
                                (services.length === offerings.length) &&
                                (services.length === procedures.length) &&
                                (services.length === phenomena.length)) {
                            for (i = 0; i < services.length; i++) {
                                var constellation = [];
                                constellation.push(services[i]);
                                constellation.push(features[i]);
                                constellation.push(offerings[i]);
                                constellation.push(procedures[i]);
                                constellation.push(phenomena[i]);
                                constellations.push(constellation);
                            }
                        } else {
                            $log.warn("The Permalink consists of a wrong combination.");
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
                                interfaceService.search(url, constellation).then(function (result) {
                                    if (result.length > 0) {
                                        var timeseries = [];
                                        angular.forEach(result, function (entry) {
                                            if (entry.type === "timeseries")
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
                                            $log.warn("No timeseries for this combinations are found.");
                                        }
                                    }
                                });
                            });
                        });
                    }
                };
            }]);