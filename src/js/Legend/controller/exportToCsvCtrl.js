angular.module('n52.core.exportTs')
        .controller('SwcExportToCsvCtrl', ['$scope', 'exportTsService',
            function ($scope, exportTsService) {
                $scope.createExportCsv = function (series) {
                    exportTsService.openInNewWindow(exportTsService.createCsvDownloadLink(series));
                };
            }]);