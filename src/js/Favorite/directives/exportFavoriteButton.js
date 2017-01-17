angular.module('n52.core.favoriteUi')
        .directive('swcExportFavoriteButton', function () {
            return {
                restrict: 'E',
                templateUrl: 'n52.core.favoriteUi.favorite-export-button',
                controller: ['$scope', 'favoriteImExportService', function ($scope, favoriteImExportService) {
                        $scope.exportFavorites = function () {
                            favoriteImExportService.exportFavorites();
                        };
                    }]
            };
        });
