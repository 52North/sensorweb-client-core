angular.module('n52.core.provider')
        .controller('SwcProviderButtonCtrl', ['$scope', '$uibModal',
            function ($scope, $uibModal) {
                $scope.selectProvider = function () {
                    // open provider list in modal window
                    $uibModal.open({
                        animation: true,
                        templateUrl: 'n52.core.provider.provider-list-modal',
                        controller: 'SwcProviderListModalCtrl'
                    });
                };
            }]);
