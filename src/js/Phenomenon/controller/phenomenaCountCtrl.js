angular.module('n52.core.phenomena')
    .controller('SwcPhenomenaCountCtrl', ['$scope', 'seriesApiInterface',
        function($scope, seriesApiInterface) {
            $scope.count = 0;
            $scope.getCount = function(phenomenon) {
                phenomenon.provider.forEach(provider => {
                    seriesApiInterface.getStations(null, provider.url, {
                        phenomenon: provider.phenomenonID
                    }).then(function(data) {
                        $scope.count = $scope.count + data.length;
                    });
                });
            };
        }
    ]);
