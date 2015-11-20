angular.module('n52.core.provider')
        .controller('SwcProviderButtonCtrl', ['$scope', '$modal',
            function ($scope, $modal) {
                $scope.selectProvider = function () {
                    // open provider list in modal window
                    $modal.open({
                        animation: true,
                        templateUrl: 'templates/map/provider-list-modal.html',
                        controller: 'SwcProviderListModalCtrl'
                    });
                };
            }]);