angular.module('n52.core.userSettings')
        .controller('SwcUserSettingsCtrl', ['$scope', '$uibModal',
            function ($scope, $uibModal) {
                $scope.open = function () {
                    $uibModal.open({
                        animation: true,
                        templateUrl: 'templates/settings/user-settings-modal.html',
                        controller: 'SwcUserSettingsWindowCtrl'
                    });
                };
            }]);