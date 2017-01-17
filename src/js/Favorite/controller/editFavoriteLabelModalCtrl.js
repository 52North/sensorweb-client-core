angular.module('n52.core.favoriteUi')
        .controller('SwcEditFavoriteLabelModalCtrl', ['$scope', 'editFavoriteModalOpener',
            function ($scope, editFavoriteModalOpener) {
                $scope.edit = function (favorite) {
                    editFavoriteModalOpener(favorite);
                };
            }])
        .service('editFavoriteModalOpener', ['$uibModal', function ($uibModal) {
                return function (favorite) {
                    $uibModal.open({
                        animation: true,
                        templateUrl: 'n52.core.favoriteUi.favorite-edit-label-modal',
                        resolve: {
                            favorite: function () {
                                return favorite;
                            }
                        },
                        controller: ['$scope', '$uibModalInstance', 'favorite', 'favoriteService',
                            function ($scope, $uibModalInstance, favorite, favoriteService) {
                                $scope.label = favorite.label;
                                $scope.close = function () {
                                    $uibModalInstance.close();
                                };
                                $scope.submit = function () {
                                    favoriteService.changeLabel(favorite, $scope.label);
                                    $uibModalInstance.close();
                                };
                            }]
                    });
                };
            }]);
