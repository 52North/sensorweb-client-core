angular.module('n52.core.translateSelector', ['pascalprecht.translate', 'n52.core.settings'])
        .directive('swcLanguageSelector', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/language/language-selector.html',
                controller: ['$scope', '$translate', 'settingsService',
                    function ($scope, $translate, settingsService) {
                        $scope.languages = settingsService.supportedLanguages;

                        $scope.useLanguage = function (code) {
                            $translate.use(code);
                        };
                    }]
            };
        });

