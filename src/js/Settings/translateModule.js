angular.module('translateModule', ['pascalprecht.translate', 'settingsModule'])
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

