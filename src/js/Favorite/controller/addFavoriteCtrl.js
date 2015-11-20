angular.module('n52.core.favoriteUi')
        .controller('SwcAddFavoriteCtrl', ['$scope', '$translate', 'favoriteService', 'Notification', function ($scope, $translate, favoriteService, Notification) {
                $scope.isFavorite = favoriteService.hasFavorite($scope.timeseries.internalId);
                $scope.toggleFavorite = function () {
                    var label;
                    if ($scope.isFavorite) {
                        favoriteService.removeFavorite($scope.timeseries.internalId);
                        label = $scope.timeseries.label;
                        Notification.primary($translate.instant('favorite.single.remove').replace('{0}', label));
                    } else {
                        favoriteService.addFavorite($scope.timeseries);
                        label = $scope.timeseries.label;
                        Notification.primary($translate.instant('favorite.single.add').replace('{0}', label));
                    }
                    $scope.isFavorite = favoriteService.hasFavorite($scope.timeseries.internalId);
                };
            }]);