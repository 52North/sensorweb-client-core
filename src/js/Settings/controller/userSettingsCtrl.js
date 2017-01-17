angular.module('n52.core.userSettings')
        .controller('SwcUserSettingsCtrl', ['$scope', '$uibModal',
            function ($scope, $uibModal) {
                $scope.open = function () {
                    $uibModal.open({
                        animation: true,
                        templateUrl: 'n52.core.userSettings.user-settings-modal',
                        controller: 'SwcUserSettingsWindowCtrl'
                    });
                };
            }]);
