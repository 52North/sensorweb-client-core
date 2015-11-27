angular.module('n52.core.userSettings')
        .controller('SwcUserSettingsCtrl', ['$scope', '$modal',
            function ($scope, $modal) {
                $scope.open = function () {
                    $modal.open({
                        animation: true,
                        templateUrl: 'templates/settings/user-settings-modal.html',
                        controller: 'SwcUserSettingsWindowCtrl'
                    });
                };
            }]);