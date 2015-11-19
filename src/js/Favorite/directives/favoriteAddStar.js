angular.module('n52.core.favoriteUi')
        .directive('swcFavoriteAddStar', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/favorite/favorite-star.html',
                scope: {
                    timeseries: "="
                },
                controller: 'SwcAddFavoriteCtrl'
            };
        });