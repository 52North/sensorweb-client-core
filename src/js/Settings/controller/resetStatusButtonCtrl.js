angular.module('n52.core.userSettings')
        .controller('SwcResetStatusButtonCtrl', ['$scope', 'statusService', 'timeseriesService', 'favoriteService',
            function ($scope, statusService, timeseriesService, favoriteService) {
                $scope.resetStatus = function () {
                    timeseriesService.removeAllTimeseries();
                    favoriteService.removeAllFavorites();
                    statusService.resetStatus();
                };
            }]);