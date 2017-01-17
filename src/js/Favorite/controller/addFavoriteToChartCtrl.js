angular.module('n52.core.favoriteUi')
        .controller('SwcAddFavoriteToChartCtrl', ['$scope', '$location', 'timeseriesService',
            function ($scope, $location, timeseriesService) {
                $scope.addToChart = function (favorite) {
                    if (favorite.type === 'single') {
                        timeseriesService.addTimeseries(favorite.timeseries);
                    } else if (favorite.type === 'group') {
                        angular.forEach(favorite.collection, function (ts) {
                            timeseriesService.addTimeseries(ts);
                        });
                    }
                    $location.url('/diagram');
                };
            }]);
