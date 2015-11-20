angular.module('n52.core.style', ['ui.bootstrap'])
        .service('styleModalOpener', ['$modal', function ($modal) {
                return function (timeseries) {
                    $modal.open({
                        animation: true,
                        templateUrl: 'templates/styling/modal-style-editor.html',
                        resolve: {
                            timeseries: function () {
                                return timeseries;
                            }
                        },
                        controller: 'ModalStyleEditorCtrl'
                    });
                };
            }]);