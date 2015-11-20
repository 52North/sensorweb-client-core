angular.module('n52.core.userSettings')
        .controller('QrCodeCtrl', ['$scope', 'permalinkGenerationService',
            function ($scope, permalinkGenerationService) {
                $scope.createQrCode = function (timeseriesId) {
                    if (angular.isUndefined($scope.dataUrl)) {
                        $scope.dataUrl = qr.toDataURL({
                            value: permalinkGenerationService.getCurrentPermalink(timeseriesId),
                            size: 5
                        });
                    } else {
                        $scope.dataUrl = undefined;
                    }
                };
            }]);