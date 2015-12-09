angular.module('n52.core.modal', [])
        .service('modalOpener', ['$uibModal',
            function ($uibModal) {
                this.open = function (configs) {
                    var defaults = {
                        animation: true,
                        controller: 'ModalWindowCtrl'
                    };
                    angular.extend(defaults, configs);
                    $uibModal.open(defaults);
                };
            }])
        .controller('ModalWindowCtrl', ['$scope', '$uibModalInstance',
            function ($scope, $uibModalInstance) {
                $scope.modal = $uibModalInstance;
                $scope.close = function () {
                    $uibModalInstance.close();
                };
            }]);