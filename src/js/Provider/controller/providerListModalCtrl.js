angular.module('n52.core.provider')
        .controller('SwcProviderListModalCtrl', ['$scope', '$modalInstance', 'providerService',
            function ($scope, $modalInstance, providerService) {
                $scope.providerList = providerService.providerList;

                $scope.close = function () {
                    $modalInstance.close();
                };

                $scope.selectProvider = function (provider) {
                    providerService.selectProvider(provider);
                    $modalInstance.close();
                };
            }]);