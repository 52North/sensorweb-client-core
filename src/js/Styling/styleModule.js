angular.module('n52.core.style', ['ui.bootstrap'])
        .service('styleModalOpener', ['$uibModal', function ($uibModal) {
                return function (timeseries) {
                    $uibModal.open({
                        animation: true,
                        templateUrl: 'templates/styling/modal-style-editor.html',
                        resolve: {
                            timeseries: function () {
                                return timeseries;
                            }
                        },
                        controller: 'SwcModalStyleEditorCtrl'
                    });
                };
            }]);