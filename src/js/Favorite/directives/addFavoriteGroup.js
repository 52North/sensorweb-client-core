angular.module('n52.core.favoriteUi')
        .directive('swcAddFavoriteGroup', function () {
            return {
                restrict: 'E',
                templateUrl: 'n52.core.favoriteUi.favorite-add-group',
                scope: {
                },
                controller: 'SwcAddFavoriteGroupCtrl'
            };
        });
