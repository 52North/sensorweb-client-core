angular.module('n52.core.favoriteUi')
        .directive('swcImportFavoriteButton', ['utils', 'favoriteImExportService', function (utils, favoriteImExportService) {
                return {
                    restrict: 'E',
                    templateUrl: 'n52.core.favoriteUi.favorite-import-button',
                    link: function (scope, element, attrs) {
                        if (utils.isFileAPISupported()) {
                            element.find('input').change({}, function (event) {
                                favoriteImExportService.importFavorites(event);
                            });
                        } else {
                            element.find('input').remove();
                            element.find('div').click(function () {
                                favoriteImExportService.importFavorites();
                            });
                        }
                    }
                };
            }]);
