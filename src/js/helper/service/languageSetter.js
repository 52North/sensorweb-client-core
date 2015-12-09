angular.module('n52.core.helper')
        .service('SwcLanguageSetter', ['$rootScope', 'tmhDynamicLocale',
            function ($rootScope, tmhDynamicLocale) {
                $rootScope.$on('$translateChangeSuccess', function (event, data) {
                    document.documentElement.setAttribute('lang', data.language);// sets "lang" attribute to html
                    // asking angular-dynamic-locale to load and apply proper AngularJS $locale setting
                    tmhDynamicLocale.set(data.language.toLowerCase().replace(/_/g, '-'));
                });
            }]);