angular.module('exportTsModule', ['timeseriesModule', 'timeModule'])
        .factory('exportTsService', ['timeService', '$window', '$translate', 'timeseriesService',
            function (timeService, $window, $translate, timeseriesService) {

                function createCsvDownloadLink(tsId) {
                    var timespan = timeService.getRequestTimespan();
                    var kvp = "?generalize=" + false; // TODO generalize???
                    kvp = kvp + "&timespan=" + encodeURIComponent(timespan);
                    kvp = kvp + "&locale=" + $translate.preferredLanguage();
                    kvp = kvp + "&zip=true";
                    kvp = kvp + "&bom=true";
                    var apiUrl = timeseriesService.getTimeseries(tsId).apiUrl;
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
