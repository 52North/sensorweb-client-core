angular.module('n52.core.userSettings', ['ui.bootstrap', 'n52.core.settings', 'n52.core.status', 'n52.core.permalinkGen'])
        .controller('UserSettingsCtrl', ['$scope', '$modal',
            function ($scope, $modal) {
                $scope.open = function () {
                    $modal.open({
                        animation: true,
                        templateUrl: 'templates/settings/user-settings-modal.html',
                        controller: 'UserSettingsWindowCtrl'
                    });
                };
            }])
        .controller('UserSettingsWindowCtrl', ['$scope', '$modalInstance',
            function ($scope, $modalInstance) {
                $scope.modal = $modalInstance;
                $scope.close = function () {
                    $modalInstance.close();
                };
            }])
        .controller('ResetStatusButtonCtrl', ['$scope', 'statusService',
            function ($scope, statusService) {
                $scope.resetStatus = function () {
                    statusService.resetStatus();
                };
            }])
        .controller('PermalinkInWindowCtrl', ['$scope', 'permalinkGenerationService', '$window',
            function ($scope, permalinkGenerationService, $window) {
                $scope.openInNewWindow = function (timeseriesId) {
                    var link = permalinkGenerationService.getCurrentPermalink(timeseriesId);
                    $window.open(link, '_blank');
                };
            }])
        .controller('PermalinkInMailCtrl', ['$scope', 'permalinkGenerationService', '$window',
            function ($scope, permalinkGenerationService, $window) {
                $scope.openInMail = function (timeseriesId) {
                    var link = permalinkGenerationService.getCurrentPermalink(timeseriesId);
                    $window.location = "mailto:?body=" + encodeURIComponent(link);
                };
            }])
        .controller('PermalinkToClipboardCtrl', ['$scope', 'permalinkGenerationService', '$window', '$translate',
            function ($scope, permalinkGenerationService, $window, $translate) {
                $scope.copyToClipboard = function (timeseriesId) {
                    var link = permalinkGenerationService.getCurrentPermalink(timeseriesId);
                    $window.prompt($translate.instant('settings.permalink.clipboardInfo'), link);
                };
            }])
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
            }])
        .directive('swcQrCode', ['permalinkGenerationService',
            function (permalinkGenerationService) {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/settings/qr-code-button.html',
                    scope: {},
                    link: function (scope, element, attrs) {
                        scope.timeseriesId = attrs.timeseriesid;
                        scope.create = function () {
                            debugger;
                            var img = qr.image({
                                value: permalinkGenerationService.getCurrentPermalink(this.timeseriesId),
                                size: 5
                            });
                            var anchor = element.find('span.qr-code');
                            anchor.find('img').remove();
                            anchor.append($(img));
                        };
                    }
                };
            }])
        .directive('swcSettingsToggleButton', ['statusService',
            function (statusService) {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/settings/settings-toggle-button.html',
                    scope: {},
                    link: function (scope, element, attrs) {
                        scope.status = statusService.status;
                        scope.field = attrs.field;
                        scope.caption = attrs.caption;
                        scope.description = attrs.description;
                        scope.toggle = function () {
                            statusService.status[attrs.field] = !statusService.status[attrs.field];
                        };
                    }
                };
            }]);