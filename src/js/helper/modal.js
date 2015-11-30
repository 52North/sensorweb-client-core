angular.module('n52.core.modal', ['ui.bootstrap'])
        .service('modalOpener', ['$modal',
            function ($modal) {
                this.open = function (configs) {
                    var defaults = {
                        animation: true,
                        controller: 'ModalWindowCtrl'
                    };
                    angular.extend(defaults, configs);
                    $modal.open(defaults);
                };
            }])
        .controller('ModalWindowCtrl', ['$scope', '$modalInstance',
            function ($scope, $modalInstance) {
                $scope.modal = $modalInstance;
                $scope.close = function () {
                    $modalInstance.close();
                };
            }]);