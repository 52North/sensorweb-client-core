angular.module('n52.core.translateSelector', ['pascalprecht.translate', 'n52.core.settings'])
        .directive('swcLanguageSelector', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/language/language-selector.html',
                controller: 'SwcLanguageSelectorCtrl'
            };
        });

