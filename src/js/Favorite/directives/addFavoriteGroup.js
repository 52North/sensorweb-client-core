angular.module('n52.core.favoriteUi')
        .directive('swcAddFavoriteGroup', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/favorite/favorite-add-group.html',
                scope: {
                },
                controller: 'SwcAddFavoriteGroupCtrl'
            };
        });
