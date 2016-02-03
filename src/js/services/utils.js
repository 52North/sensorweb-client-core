angular.module('n52.core.utils', [])
        .factory('utils', ['$window', 'settingsService',
            function ($window, settingsService) {
                function isFileAPISupported() {
                    var isIOS = $window.navigator.userAgent.match(/(iPad|iPhone|iPod)/g) !== null;
                    return ($window.File && $window.FileReader && $window.Blob) && !isIOS;
                }

                function createInternalId(tsId, apiUrl) {
                    return settingsService.restApiUrls[apiUrl] + "__" + tsId;
                }

                function createRequestTimespan(start, end) {
                    return moment(start).format() + "/" + moment(end).format();
                }

                function getTimeseriesCombinationByInternalId(internalId) {
                    var combination = {};
                    angular.forEach(settingsService.restApiUrls, function (apiID, url) {
                        if (internalId.indexOf(apiID) === 0) {
                            combination = {
                                id: internalId.substring(internalId.indexOf('__') + 2, internalId.length),
                                apiUrl: url
                            };
                        }
                    });
                    return combination;
                }
                
                function createBufferedCurrentTimespan (time, buffer) {
                    if (angular.isObject(buffer)) {
                        return {
                            start: moment(time.start).subtract(buffer),
                            end: moment(time.end).add(buffer)
                        };
                    } else {
                        return {
                            start: time.start,
                            end: time.end
                        };
                    }
                };

                return {
                    createRequestTimespan: createRequestTimespan,
                    getTimeseriesCombinationByInternalId: getTimeseriesCombinationByInternalId,
                    createInternalId: createInternalId,
                    isFileAPISupported: isFileAPISupported,
                    createBufferedCurrentTimespan: createBufferedCurrentTimespan
                };
            }]);