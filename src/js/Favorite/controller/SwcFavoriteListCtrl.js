angular.module('n52.core.favoriteUi')
        .controller('SwcFavoriteListCtrl', ['$scope', '$location', 'favoriteService', 'timeseriesService', 'editFavoriteModalOpener',
            function ($scope, $location, favoriteService, timeseriesService, editFavoriteModalOpener) {
                $scope.favorites = favoriteService.favorites;
                $scope.edit = function (favorite) {
                    editFavoriteModalOpener(favorite);
                };
                $scope.addToDiagram = function (favorite) {
                    if (favorite.type === "single") {
                        timeseriesService.addTimeseries(favorite.timeseries);
                    } else if (favorite.type === "group") {
                        angular.forEach(favorite.collection, function (ts) {
                            timeseriesService.addTimeseries(ts);
                        });
                    }
                    $location.url('/diagram');
                };
                $scope.delete = function (favorite) {
                    favoriteService.removeFavorite(favorite.id);
                };
            }])
        .service('editFavoriteModalOpener', ['$modal', function ($modal) {
                return function (favorite) {
                    $modal.open({
                        animation: true,
                        templateUrl: 'templates/favorite/favorite-edit.html',
                        resolve: {
                            favorite: function () {
                                return favorite;
                            }
                        },
                        controller: ['$scope', '$modalInstance', 'favorite', 'favoriteService', function ($scope, $modalInstance, favorite, favoriteService) {
                                $scope.label = favorite.label;
                                $scope.close = function () {
                                    $modalInstance.close();
                                };
                                $scope.submit = function () {
                                    favoriteService.changeLabel(favorite, $scope.label);
                                    $modalInstance.close();
                                };
                            }]
                    });
                };
            }]);       