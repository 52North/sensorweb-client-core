angular.module('n52.core.base')
    .service('utils', ['$window', 'settingsService',
        function($window, settingsService) {
            this.isFileAPISupported = function() {
                var isIOS = $window.navigator.userAgent.match(/(iPad|iPhone|iPod)/g) !== null;
                return ($window.File && $window.FileReader && $window.Blob) && !isIOS;
            };

            this.createInternalId = function(ts) {
                return settingsService.restApiUrls[ts.apiUrl] + "__" + ts.id;
            };

            this.createRequestTimespan = function(start, end) {
                return moment(start).format() + "/" + moment(end).format();
            };

            this.getTimeseriesCombinationByInternalId = function(internalId) {
                var combination = {};
                angular.forEach(settingsService.restApiUrls, function(apiID, url) {
                    if (internalId.indexOf(apiID) === 0) {
                        combination = {
                            id: internalId.substring(internalId.indexOf('__') + 2, internalId.length),
                            apiUrl: url
                        };
                    }
                });
                return combination;
            };

            this.createBufferedCurrentTimespan = function(time) {
                var start = moment(time.start);
                var end = moment(time.end);
                var factor = settingsService.timebufferFactor || 0.0;
                var duration = end.diff(start) * factor;
                return {
                    start: moment(time.start).subtract(moment.duration(duration)),
                    end: moment(time.end).add(moment.duration(duration))
                };
            };
        }
    ])
    .service('measurementPresentDataset', ['timeseriesService', '$location',
        function(timeseriesService, $location) {
            this.presentDataset = function(dataset, providerUrl) {
                dataset.apiUrl = providerUrl;
                timeseriesService.addTimeseries(dataset);
                $location.url('/diagram');
            };
        }
    ]);
