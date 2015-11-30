angular.module('n52.core.exportTs')
        .controller('SwcExportToCsvCtrl', ['$scope', 'exportTsService',
            function ($scope, exportTsService) {
                $scope.createExportCsv = function (id) {
                    exportTsService.openInNewWindow(exportTsService.createCsvDownloadLink(id));
                };
            }]);