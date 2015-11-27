angular.module('n52.core.legend')
        .controller('SwcExportToCsvCtrl', ['$scope', 'exportTsService',
            function ($scope, exportTsService) {
                $scope.createExportCsv = function (id) {
                    exportTsService.openInNewWindow(exportTsService.createCsvDownloadLink(id));
                };
            }]);