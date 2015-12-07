angular.module('n52.core.userSettings')
        .controller('SwcLanguageSelectorCtrl', ['$scope', '$translate', 'settingsService',
            function ($scope, $translate, settingsService) {
                $scope.languages = settingsService.supportedLanguages;
                $scope.useLanguage = function (code) {
                    $translate.use(code);
                };
            }]);