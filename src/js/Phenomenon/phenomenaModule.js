angular.module('n52.core.phenomena', [])
        .factory('PhenomenonListFactory', ['$rootScope', 'interfaceService', 'statusService', 'settingsService',
            function ($rootScope, interfaceService, statusService, settingsService) {
                var phenomena = {};
                phenomena.selection = null;
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
                    phenomena.items = [];
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
            }]);