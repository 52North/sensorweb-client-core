angular.module('n52.core.favoriteUi', ['n52.core.timeseries', 'n52.core.exportTs', 'n52.core.style', 'n52.core.favorite', 'n52.core.utils', 'ui-notification'])
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
            }])
        .controller('SwcAddFavoriteGroupCtrl', ['$scope', '$translate', 'favoriteService', 'timeseriesService', 'Notification', function ($scope, $translate, favoriteService, timeseriesService, Notification) {
                $scope.createFavoriteGroup = function () {
                    var label = favoriteService.addFavoriteGroup(timeseriesService.getAllTimeseries());
                    if (angular.isString(label)) {
                        Notification.primary($translate.instant('favorite.group.add').replace('{0}', label));
                    } else {
                        Notification.primary($translate.instant('favorite.group.noTimeseries'));
                    }
                };
            }])
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