angular.module('n52.core.phenomena')
    .controller('SwcPhenomenaCountCtrl', ['$scope', 'interfaceService', 'statusService',
        function($scope, interfaceService, statusService) {
            $scope.count = 0;
            $scope.getCount = function(phenomenon) {
                phenomenon.provider.forEach(provider => {
                    interfaceService.getStations(null, provider.url, {
                        phenomenon: provider.phenomenonID
                    }).then(function(data) {
                        $scope.count = $scope.count + data.length;
                    });
                });
            };
        }
    ]);
