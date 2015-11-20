angular.module('n52.core.provider')
        .controller('SwcProviderLabelCtrl', ['$scope', 'providerService',
            function ($scope, providerService) {
                $scope.selectedProvider = providerService.selectedProvider;
            }]);