angular.module('n52.core.phenomena', ['n52.core.interface', 'n52.core.status'])
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
        .factory('PhenomenonListFactory', ['$rootScope', 'interfaceService', 'statusService', 'settingsService',
            function ($rootScope, interfaceService, statusService, settingsService) {
                var phenomena = {};
                phenomena.items = [];

                loadPhenomena = function () {
                    if (settingsService.aggregateServicesInMap && angular.isUndefined(statusService.status.apiProvider.url)) {
                        loadAggregatedPhenomenons();
                    } else {
                        var params = {
                            service: statusService.status.apiProvider.serviceID
                        };
                        interfaceService.getPhenomena(null, statusService.status.apiProvider.url, params).then(function (data) {
                            phenomena.items = data;
                        });
                    }
                };

                loadAggregatedPhenomenons = function () {
                    angular.forEach(settingsService.restApiUrls, function (id, url) {
                        interfaceService.getServices(url).then(function (providers) {
                            angular.forEach(providers, function (provider) {
                                var params = {
                                    service: provider.id
                                };
                                interfaceService.getPhenomena(null, url, params).then(function (data) {
                                    angular.forEach(data, function(entry){
                                        phenomena.items.push(entry);
                                    });
                                });
                            });
                        });
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