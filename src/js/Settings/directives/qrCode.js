angular.module('n52.core.userSettings')
        .directive('swcQrCode', ['permalinkGenerationService',
            function (permalinkGenerationService) {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/settings/qr-code-button.html',
                    scope: {},
                    link: function (scope, element, attrs) {
                        scope.timeseriesId = attrs.timeseriesid;
                        scope.create = function () {
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
            }]);