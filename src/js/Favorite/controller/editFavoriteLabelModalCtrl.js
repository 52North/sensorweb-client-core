angular.module('n52.core.favoriteUi')
        .controller('SwcEditFavoriteLabelModalCtrl', ['$scope', 'editFavoriteModalOpener',
            function ($scope, editFavoriteModalOpener) {
                $scope.edit = function (favorite) {
                    editFavoriteModalOpener(favorite);
                };
            }])
        .service('editFavoriteModalOpener', ['$modal', function ($modal) {
                return function (favorite) {
                    $modal.open({
                        animation: true,
                        templateUrl: 'templates/favorite/favorite-edit-label-modal.html',
                        resolve: {
                            favorite: function () {
                                return favorite;
                            }
                        },
                        controller: ['$scope', '$modalInstance', 'favorite', 'favoriteService', 
                            function ($scope, $modalInstance, favorite, favoriteService) {
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
        