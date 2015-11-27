angular.module('n52.core.exportTs', ['n52.core.timeseries', 'n52.core.time'])
        .factory('exportTsService', ['timeService', '$window', '$translate', 'timeseriesService',
            function (timeService, $window, $translate, timeseriesService) {

                function createCsvDownloadLink(ts) {
                    var apiUrl = ts.apiUrl, tsId = ts.id;
                    var timespan = timeService.getCurrentTimespan();
                    var kvp = "?generalize=" + false;
                    kvp = kvp + "&timespan=" + encodeURIComponent(timespan);
                    kvp = kvp + "&locale=" + $translate.preferredLanguage();
                    kvp = kvp + "&zip=true";
                    kvp = kvp + "&bom=true";
                    return apiUrl + "/timeseries/" + tsId + "/getData.zip" + kvp;
                }

                function openInNewWindow(link) {
                    $window.open(link);
                }

                return {
                    openInNewWindow: openInNewWindow,
                    createCsvDownloadLink: createCsvDownloadLink
                };
            }]);
