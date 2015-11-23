angular.module('n52.core.favoriteUi')
        .controller('SwcFavoriteListCtrl', ['$scope', 'favoriteService',
            function ($scope, favoriteService) {
                $scope.favorites = favoriteService.favorites;
            }]);