angular.module('n52.core.favoriteUi')
    .directive('swcFavoriteList', function() {
        return {
            restrict: 'E',
            templateUrl: 'n52.core.favoriteUi.favorite-list',
            scope: {},
            controller: 'SwcFavoriteListCtrl'
        };
    });
