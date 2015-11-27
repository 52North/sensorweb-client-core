angular.module('n52.core.userSettings')
        .controller('SwcPermalinkInWindowCtrl', ['$scope', 'permalinkGenerationService', '$window',
            function ($scope, permalinkGenerationService, $window) {
                $scope.openInNewWindow = function (timeseriesId) {
                    var link = permalinkGenerationService.getCurrentPermalink(timeseriesId);
                    $window.open(link, '_blank');
                };
            }]);