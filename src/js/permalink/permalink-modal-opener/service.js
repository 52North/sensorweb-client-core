require('../permalink');

angular.module('n52.core.permalink')
    .service('permalinkOpener', ['$uibModal',
        function($uibModal) {
            this.openPermalink = (url) => {
                $uibModal.open({
                    animation: true,
                    templateUrl: 'n52.core.permalink.simple-modal',
                    resolve: {
                        url: () => {
                            return url;
                        }
                    },
                    controller: ['$scope', '$uibModalInstance', 'url',
                        function ($scope, $uibModalInstance, url) {
                            $scope.url = url;

                            $scope.close = () => {
                                $uibModalInstance.close();
                            };
                        }]
                });
            };
        }
    ]);
