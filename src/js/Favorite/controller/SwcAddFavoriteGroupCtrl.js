angular.module('n52.core.favoriteUi')
        .controller('SwcAddFavoriteGroupCtrl', ['$scope', '$translate', 'favoriteService', 'timeseriesService', 'Notification', function ($scope, $translate, favoriteService, timeseriesService, Notification) {
                $scope.createFavoriteGroup = function () {
                    var label = favoriteService.addFavoriteGroup(timeseriesService.getAllTimeseries());
                    if (angular.isString(label)) {
                        Notification.primary($translate.instant('favorite.group.add').replace('{0}', label));
                    } else {
                        Notification.primary($translate.instant('favorite.group.noTimeseries'));
                    }
                };
            }]);