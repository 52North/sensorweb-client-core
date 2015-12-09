angular.module('n52.core.provider', [])
        .factory('providerService', ['$rootScope', 'settingsService', 'interfaceService', 'statusService',
            function ($rootScope, settingsService, interfaceService, statusService) {
                var providerList = [];
                var selectedProvider = {
                    label: ""
                };

                getAllProviders = function () {
                    angular.forEach(settingsService.restApiUrls, function (elem, url) {
                        interfaceService.getServices(url).then(function (providers) {
                            angular.forEach(providers, function (provider) {
                                var isBlacklisted = false;
                                angular.forEach(settingsService.providerBlackList, function (entry) {
                                    if (entry.serviceID === provider.id && entry.apiUrl === url) {
                                        isBlacklisted = true;
                                    }
                                });
                                if (!isBlacklisted) {
                                    if (url === statusService.status.apiProvider.url && statusService.status.apiProvider.serviceID === provider.id) {
                                        provider.selected = true;
                                        selectedProvider.label = provider.label;
                                    } else {
                                        provider.selected = false;
                                    }
                                    provider.url = url;
                                    providerList.push(provider);
                                } else {
                                    console.info(url + "services/" + provider.id + " is blacklisted!");
                                }
                            });
                        });
                    });
                };

                selectProvider = function (selection) {
                    angular.forEach(providerList, function (provider) {
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

                getAllProviders();

                return {
                    providerList: providerList,
                    selectedProvider: selectedProvider,
                    selectProvider: selectProvider
                };
            }]);