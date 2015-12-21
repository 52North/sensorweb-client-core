angular.module('n52.core.phenomena')
        .controller('SwcPhenomenaCountCtrl', ['$scope', 'interfaceService', 'statusService',
            function ($scope, interfaceService, statusService) {
                $scope.count = null;
                $scope.getCount = function (phenomenon) {
                    interfaceService.getTimeseries(null, statusService.status.apiProvider.url, {phenomenon: phenomenon.id}).then(function (data) {
                        $scope.count = data.length;
                    });
                };
            }]);