angular.module('n52.core.favoriteUi')
        .directive('swcFavoriteAddStar', function () {
            return {
                restrict: 'E',
                templateUrl: 'n52.core.favoriteUi.favorite-star',
                scope: {
                    timeseries: "="
                },
                controller: 'SwcAddFavoriteCtrl'
            };
        });
