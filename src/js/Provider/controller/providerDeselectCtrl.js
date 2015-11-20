angular.module('n52.core.provider')
        .controller('SwcProviderDeselectProviderCtrl', ['$scope', 'providerService', function ($scope, providerService) {
                $scope.deselectAll = function () {
                    providerService.selectProvider();
                };
            }]);