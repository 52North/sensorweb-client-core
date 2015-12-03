angular.module('n52.core.userSettings')
        .controller('SwcUserSettingsWindowCtrl', ['$scope', '$uibModalInstance',
            function ($scope, $uibModalInstance) {
                $scope.modal = $uibModalInstance;
                $scope.close = function () {
                    $uibModalInstance.close();
                };
            }]);