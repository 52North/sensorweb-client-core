angular.module('n52.core.favoriteUi')
        .controller('SwcDeleteFavoriteCtrl', ['$scope', 'favoriteService',
            function ($scope, favoriteService) {
                $scope.delete = function (favorite) {
                    favoriteService.removeFavorite(favorite.id);
                };
            }]);