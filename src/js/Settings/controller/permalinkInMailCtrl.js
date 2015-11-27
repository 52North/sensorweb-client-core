angular.module('n52.core.userSettings')
        .controller('SwcPermalinkInMailCtrl', ['$scope', 'permalinkGenerationService', '$window',
            function ($scope, permalinkGenerationService, $window) {
                $scope.openInMail = function (timeseriesId) {
                    var link = permalinkGenerationService.getCurrentPermalink(timeseriesId);
                    $window.location = "mailto:?body=" + encodeURIComponent(link);
                };
            }]);