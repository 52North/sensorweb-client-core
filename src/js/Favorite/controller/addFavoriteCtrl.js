angular.module('n52.core.favoriteUi')
    .controller('SwcAddFavoriteCtrl', ['$scope', '$translate', 'favoriteService', 'Notification', 'labelMapperSrvc',
        function($scope, $translate, favoriteService, Notification, labelMapperSrvc) {
            $scope.isFavorite = favoriteService.hasTimeseriesAsFavorite($scope.timeseries);
            $scope.toggleFavorite = function() {
                if ($scope.isFavorite) {
                    favoriteService.removeFavorite($scope.timeseries);
                    labelMapperSrvc.getMappedLabel($scope.timeseries.label).then((label) => {
                        Notification.primary($translate.instant('favorite.single.remove').replace('{0}', label));
                    });
                } else {
                    favoriteService.addFavorite($scope.timeseries);
                    labelMapperSrvc.getMappedLabel($scope.timeseries.label).then((label) => {
                        Notification.primary($translate.instant('favorite.single.add').replace('{0}', label));
                    });
                }
                $scope.isFavorite = favoriteService.hasTimeseriesAsFavorite($scope.timeseries);
            };
        }
    ]);
