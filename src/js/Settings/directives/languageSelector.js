angular.module('n52.core.translate', [])
        .directive('swcLanguageSelector', function () {
            return {
                restrict: 'E',
                templateUrl: 'n52.core.translate.language-selector',
                controller: 'SwcLanguageSelectorCtrl'
            };
        });
