angular.module('n52.core.style', [])
        .service('styleModalOpener', ['$uibModal', function ($uibModal) {
                return function (timeseries) {
                    $uibModal.open({
                        animation: true,
                        templateUrl: 'n52.core.style.modal-style-editor',
                        resolve: {
                            timeseries: function () {
                                return timeseries;
                            }
                        },
                        controller: 'SwcModalStyleEditorCtrl'
                    });
                };
            }]);
