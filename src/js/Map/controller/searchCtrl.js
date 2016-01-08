angular.module('n52.core.map')
        .controller('SwcSearchCtrl', ['$scope', 'mapService', function ($scope, mapService) {
                $scope.startSearch = function (term) {
                    if (angular.isDefined(term) && angular.isString(term)) {
                        mapService.map.bounds.address = term;
                    }
                };
            }]);