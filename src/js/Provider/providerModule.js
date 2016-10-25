angular.module('n52.core.provider', [])
    .factory('providerService', ['$rootScope', 'statusService', 'servicesHelper',
        function($rootScope, statusService, servicesHelper) {
            var providerList = [];
            var selectedProvider = {
                label: ""
            };

            getAllProviders = function(platformType) {
                providerList = [];
                servicesHelper.doForAllServices(function(provider, url) {
                    if (url === statusService.status.apiProvider.url && statusService.status.apiProvider.serviceID === provider.id) {
                        provider.selected = true;
                        selectedProvider.label = provider.label;
                    } else {
                        provider.selected = false;
                    }
                    provider.url = url;
                    providerList.push(provider);
                }, platformType);
                return providerList;
            };

            selectProvider = function(selection) {
                angular.forEach(providerList, function(provider) {
                    if (selection && selection.id === provider.id && selection.url === provider.url) {
                        provider.selected = true;
                        selectedProvider.label = provider.label;
                        statusService.status.apiProvider = {
                            url: provider.url,
                            serviceID: provider.id
                        };
                        $rootScope.$emit('newProviderSelected');
                        return;
                    } else {
                        provider.selected = false;
                    }
                });
                if (!selection) {
                    statusService.status.apiProvider = {};
                    $rootScope.$emit('newProviderSelected');
                    return;
                }
            };

            return {
                getAllProviders: getAllProviders,
                providerList: providerList,
                selectedProvider: selectedProvider,
                selectProvider: selectProvider
            };
        }
    ]);
