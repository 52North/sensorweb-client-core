angular.module('n52.core.provider', [])
    .service('providerService', ['$rootScope', 'statusService', 'servicesHelper', '$q', 'interfaceService',
        function($rootScope, statusService, servicesHelper, $q, interfaceService) {

            addProviderToUserList = function(provider, providerList) {
                initStatusProviderList();
                var result = providerList.find(entry => {
                    return entry.url === provider.url &&
                        entry.id === provider.id;
                });
                if (result === undefined) {
                    provider.isUserAdded = true;
                    providerList.push(provider);
                    statusService.status.addedProvider.push({
                        id: provider.id,
                        url: provider.url
                    });
                }
            };

            removeProviderFromUserList = function(provider, providerList) {
                providerList.splice(providerList.findIndex(entry => {
                    return entry.id === provider.id && entry.url === provider.url;
                }), 1);
                statusService.status.addedProvider.splice(statusService.status.addedProvider.findIndex(entry => {
                    return entry.id === provider.id && entry.url === provider.url;
                }), 1);
            };

            initStatusProviderList = function() {
                if (!statusService.status.addedProvider) {
                    statusService.status.addedProvider = [];
                }
            };

            isProviderSelected = function(provider, url) {
                if (url === statusService.status.apiProvider.url && statusService.status.apiProvider.serviceID === provider.id) {
                    return true;
                }
                return false;
            };

            addToProviderList = function(provider, url, providerList) {
                provider.url = url;
                providerList.push(provider);
            };

            this.providerList = [];
            this.selectedProvider = {
                label: ""
            };

            this.deleteProvider = function(provider) {
                removeProviderFromUserList(provider, this.providerList);
            };

            this.getAllProviders = function(platformType) {
                this.providerList = [];
                servicesHelper.doForAllServices((provider, url) => {
                    provider.selected = isProviderSelected(provider, url);
                    if (provider.selected) this.selectedProvider.label = provider.label;
                    addToProviderList(provider, url, this.providerList);
                }, platformType);
                initStatusProviderList();
                statusService.status.addedProvider.forEach(entry => {
                    interfaceService.getServices(entry.url, entry.id, {
                        platformTypes: platformType
                    }).then(provider => {
                        provider.selected = isProviderSelected(provider, entry.url);
                        provider.isUserAdded = true;
                        if (provider.selected) this.selectedProvider.label = provider.label;
                        addToProviderList(provider, entry.url, this.providerList);
                    });
                });
                return this.providerList;
            };

            this.selectProvider = function(selection) {
                angular.forEach(this.providerList, (provider) => {
                    if (selection && selection.id === provider.id && selection.url === provider.url) {
                        provider.selected = true;
                        this.selectedProvider.label = provider.label;
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

            this.addProvider = function(url) {
                return $q((resolve, reject) => {
                    interfaceService.getServices(url)
                        .then(res => {
                            res.forEach(entry => {
                                entry.url = url;
                                addProviderToUserList(entry, this.providerList);
                            });
                            resolve();
                        }, error => {
                            reject();
                        });
                });
            };
        }
    ]);
