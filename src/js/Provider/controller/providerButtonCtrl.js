angular.module('n52.core.provider')
        .controller('SwcProviderButtonCtrl', ['$scope', '$uibModal',
            function ($scope, $uibModal) {
                $scope.selectProvider = function () {
                    // open provider list in modal window
                    $uibModal.open({
                        animation: true,
                        templateUrl: 'templates/map/provider-list-modal.html',
                        controller: 'SwcProviderListModalCtrl'
                    });
                };
            }]);