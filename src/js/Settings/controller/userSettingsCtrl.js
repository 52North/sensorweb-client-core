angular.module('n52.core.userSettings')
        .controller('UserSettingsCtrl', ['$scope', '$modal',
            function ($scope, $modal) {
                $scope.open = function () {
                    $modal.open({
                        animation: true,
                        templateUrl: 'templates/settings/user-settings-modal.html',
                        controller: 'UserSettingsWindowCtrl'
                    });
                };
            }]);