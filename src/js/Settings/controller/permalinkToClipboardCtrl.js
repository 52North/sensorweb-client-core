angular.module('n52.core.userSettings')
        .controller('SwcPermalinkToClipboardCtrl', ['$scope', 'permalinkGenerationService', '$window', '$translate',
            function ($scope, permalinkGenerationService, $window, $translate) {
                $scope.copyToClipboard = function (timeseriesId) {
                    var link = permalinkGenerationService.getCurrentPermalink(timeseriesId);
                    $window.prompt($translate.instant('settings.permalink.clipboardInfo'), link);
                };
            }]);