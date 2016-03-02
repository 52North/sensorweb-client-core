angular.module('n52.core.exportTs', [])
        .factory('exportTsService', ['statusService', '$window', '$translate', 'utils',
            function (statusService, $window, $translate, utils) {

                function createCsvDownloadLink(ts) {
                    var apiUrl = ts.apiUrl, tsId = ts.id;
                    var timespan = statusService.getTime();
                    var kvp = "?generalize=" + false;
                    kvp = kvp + "&timespan=" + encodeURIComponent(utils.createRequestTimespan(timespan.start, timespan.end));
                    kvp = kvp + "&locale=" + $translate.preferredLanguage();
                    kvp = kvp + "&zip=true";
                    kvp = kvp + "&bom=true";
                    return apiUrl + "timeseries/" + tsId + "/getData.zip" + kvp;
                }

                function openInNewWindow(link) {
                    $window.open(link);
                }

                return {
                    openInNewWindow: openInNewWindow,
                    createCsvDownloadLink: createCsvDownloadLink
                };
            }]);
