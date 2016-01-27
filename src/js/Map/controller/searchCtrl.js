angular.module('n52.core.map')
        .controller('SwcSearchCtrl', ['$scope', 'mapService', 'nominatimService', 'leafletBoundsHelpers', 'settingsService',
            function ($scope, mapService, nominatimService, leafletBoundsHelpers, settingsService) {
                $scope.startSearch = function (term) {
                    if (angular.isDefined(term) && angular.isString(term)) {
                        nominatimService.query(term).then(function (data) {
                            angular.copy(leafletBoundsHelpers.createBoundsFromArray([
                                [parseFloat(data.boundingbox[0]), parseFloat(data.boundingbox[2])],
                                [parseFloat(data.boundingbox[1]), parseFloat(data.boundingbox[3])]]), mapService.map.bounds);
                            mapService.map.markers.searchResult = {
                                lat: parseFloat(data.lat),
                                lng: parseFloat(data.lon),
                                icon: settingsService.searchResultIconOptions ? settingsService.searchResultIconOptions : {}
                            };
                        });
                    }
                };
            }]);