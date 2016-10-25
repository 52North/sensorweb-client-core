angular.module('n52.core.provider')
    .controller('SwcProviderListModalCtrl', ['$scope', '$uibModalInstance', 'providerService',
        function($scope, $uibModalInstance, providerService) {
            $scope.providerList = providerService.getAllProviders('all');

            $scope.close = function() {
                $uibModalInstance.close();
            };

            $scope.selectProvider = function(provider) {
                providerService.selectProvider(provider);
                $uibModalInstance.close();
            };
        }
    ]);
