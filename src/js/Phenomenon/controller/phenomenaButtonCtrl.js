angular.module('n52.core.phenomena')
        .controller('SwcPhenomenaButtonController', ['$scope', 'statusService',
            function ($scope, statusService) {
                $scope.status = statusService.status;
                $scope.togglePhenomena = function () {
                    statusService.status.showPhenomena = !statusService.status.showPhenomena;
                };
            }]);