mainApp.requires.push('n52.core.favoriteIE9ImExport');
angular.module('n52.core.favoriteIE9ImExport', ['LocalStorageModule'])
        .service('imExportFavoriteModalOpener', ['$modal', function ($modal) {
            return function (data) {
                $modal.open({
                    animation: true,
                    templateUrl: 'templates/ie9/import-export.html',
                    resolve: {
                        data: function () {
                            return data;
                        }
                    },
                    controller: ['$scope', '$modalInstance', 'data', function ($scope, $modalInstance, data) {
                        $scope.header = data.header;
                        $scope.text = data.text;
                        $scope.content = data.content;
                        $scope.close = function() {
                            $modalInstance.close();
                        };
                        $scope.submit = function () {
                            if (data.submit)
                                data.submit($scope.content);
                            $modalInstance.close();
                        };
                    }]
                });
            };
        }])
        // overrides the core service
        .factory('favoriteImExportService', ['favoriteService', '$translate', 'imExportFavoriteModalOpener', function (favoriteService, $translate, imExportFavoriteModalOpener) {
            function exportFavorites() {
                var data = {
                    header: $translate.instant('favorite.export.header'),
                    text: $translate.instant('favorite.export.text'),
                    content: angular.toJson(favoriteService.favorites, 2)
                };
                imExportFavoriteModalOpener(data);
            }

            function importFavorites() {
                var override = true;
                if (favoriteService.hasFavorites()) {
                    override = confirm($translate.instant('favorite.import.override'));
                }
                if (override) {
                    var data = {
                        header: $translate.instant('favorite.import.header'),
                        text: $translate.instant('favorite.import.text'),
                        content: "",
                        submit: function (json) {
                            favoriteService.setFavorites(angular.fromJson(json));
                        }
                    };
                    imExportFavoriteModalOpener(data);
                }
            }

            return {
                importFavorites: importFavorites,
                exportFavorites: exportFavorites
            };
        }]);