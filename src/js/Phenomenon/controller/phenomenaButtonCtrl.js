angular.module('n52.core.phenomena')
        .controller('SwcPhenomenaButtonController', ['$scope', 'statusService', 'PhenomenonListFactory', 
            function ($scope, statusService, PhenomenonListFactory) {
                $scope.status = statusService.status;
                
                $scope.selectedPhenomenon = PhenomenonListFactory.phenomena;
                
                $scope.togglePhenomena = function () {
                    statusService.status.showPhenomena = !statusService.status.showPhenomena;
                };
            }]);