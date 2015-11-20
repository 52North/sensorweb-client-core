angular.module('n52.core.userSettings')
        .controller('UserSettingsWindowCtrl', ['$scope', '$modalInstance',
            function ($scope, $modalInstance) {
                $scope.modal = $modalInstance;
                $scope.close = function () {
                    $modalInstance.close();
                };
            }]);