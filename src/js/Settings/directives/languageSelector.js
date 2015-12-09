angular.module('n52.core.translateSelector', [])
        .directive('swcLanguageSelector', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/language/language-selector.html',
                controller: 'SwcLanguageSelectorCtrl'
            };
        });

