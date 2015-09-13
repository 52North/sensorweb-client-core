var phenomenaModule = angular.module('phenomenaModule', ['interfaceModule', 'statusModule'])
        .controller('PhenomenonListCtrl', ['$scope', 'PhenomenonListFactory', function ($scope, PhenomenonListFactory) {
                $scope.phenomena = PhenomenonListFactory.phenomena;

                $scope.showAllPhenomenons = function () {
                    PhenomenonListFactory.setSelection();
                };

                $scope.showSpecificPhenomenon = function (phenomenon) {
                    PhenomenonListFactory.setSelection(phenomenon);
                };

                $scope.isSelected = function (phenomenon) {
                    return angular.equals(phenomenon, $scope.phenomena.selection);
                };
            }])
        .factory('PhenomenonListFactory', ['$rootScope', 'interfaceService', 'statusService',
            function ($rootScope, interfaceService, statusService) {
                var phenomena = {};
                phenomena.items = [];

                loadPhenomena = function () {
                    var params = {
                        service: statusService.status.apiProvider.serviceID
                    };
                    interfaceService.getPhenomena(null, statusService.status.apiProvider.url, params).success(function (data, status, headers, config) {
                        phenomena.items = data;
                    });
                };

                setSelection = function (phenomenon) {
                    if (phenomenon) {
                        phenomena.selection = phenomenon;
                        $rootScope.$emit('phenomenonSelected', phenomenon);
                    } else {
                        phenomena.selection = null;
                        $rootScope.$emit('allPhenomenaSelected');
                    }
                };

                $rootScope.$on('newProviderSelected', loadPhenomena);

                loadPhenomena();
                return {
                    setSelection: setSelection,
                    phenomena: phenomena
                };
            }])
        .controller('phenomenaButtonController', ['$scope', 'statusService',
            function ($scope, statusService) {
                $scope.status = statusService.status;
                $scope.togglePhenomena = function () {
                    statusService.status.showPhenomena = !statusService.status.showPhenomena;
                };
            }]);