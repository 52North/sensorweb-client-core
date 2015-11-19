angular.module('n52.core.favoriteUi')
        .directive('swcFavoriteList', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/favorite/favorite-list.html',
                scope: {
                },
                controller: 'swcFavoriteListCtrl'
            };
        });