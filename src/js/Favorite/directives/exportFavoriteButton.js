angular.module('n52.core.favoriteUi')
        .directive('swcExportFavoriteButton', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/favorite/favorite-export-button.html',
                controller: ['$scope', 'favoriteImExportService', function ($scope, favoriteImExportService) {
                        $scope.exportFavorites = function () {
                            favoriteImExportService.exportFavorites();
                        };
                    }]
            };
        });