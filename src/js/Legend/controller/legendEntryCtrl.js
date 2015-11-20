angular.module('n52.core.legend')
        .controller('SwcLegendEntryCtrl', ['$scope', 'timeseriesService', 'timeService', 'styleService', 'exportTsService', 'mapService', '$location', 'styleModalOpener',
            function ($scope, timeseriesService, timeService, styleService, exportTsService, mapService, $location, styleModalOpener) {
                $scope.infoVisible = false;
                $scope.toggleSelection = function (ts) {
                    styleService.toggleSelection(ts);
                };
                $scope.removeTs = function (ts) {
                    timeseriesService.removeTimeseries(ts.internalId);
                };
                $scope.toggleDiagram = function (ts) {
                    styleService.toggleTimeseriesVisibility(ts);
                };
                $scope.openStyling = function (ts) {
                    styleModalOpener(ts);
                };
                $scope.showInformation = function () {
                    $scope.infoVisible = !$scope.infoVisible;
                };
                $scope.showInMap = function (ts) {
                    mapService.showStation(ts);
                    $location.url('/map');
                };
                $scope.jumpToLastTimeStamp = function (lastValue) {
                    if (lastValue && lastValue.timestamp) {
                        timeService.jumpToLastTimeStamp(lastValue.timestamp, true);
                    }
                };
                $scope.jumpToFirstTimeStamp = function (firstValue) {
                    if (firstValue && firstValue.timestamp) {
                        timeService.jumpToLastTimeStamp(firstValue.timestamp, true);
                    }
                };
                $scope.selectRefValue = function (refValue, ts) {
                    timeseriesService.toggleReferenceValue(refValue, ts.internalId);
                };
                $scope.createExportCsv = function (id) {
                    exportTsService.openInNewWindow(exportTsService.createCsvDownloadLink(id));
                };
            }]);