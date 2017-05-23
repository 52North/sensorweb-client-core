angular.module('n52.core.provider', [])
    .service('providerService', ['$rootScope', 'statusService', '$q', 'seriesApiInterface', 'settingsService',
        function($rootScope, statusService, $q, seriesApiInterface, settingsService) {

            var addProviderToUserList = function(provider, providerList) {
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

            var removeProviderFromUserList = function(provider, providerList) {
                providerList.splice(providerList.findIndex(entry => {
                    return entry.id === provider.id && entry.url === provider.url;
                }), 1);
                statusService.status.addedProvider.splice(statusService.status.addedProvider.findIndex(entry => {
                    return entry.id === provider.id && entry.url === provider.url;
                }), 1);
            };

            var initStatusProviderList = function() {
                if (!statusService.status.addedProvider) {
                    statusService.status.addedProvider = [];
                }
            };

            var isProviderSelected = function(provider, url) {
                if (url === statusService.status.apiProvider.url && statusService.status.apiProvider.serviceID === provider.id) {
                    return true;
                }
                return false;
            };

            var addToProviderList = function(provider, url, providerList) {
                provider.url = url;
                providerList.push(provider);
            };

            this.providerList = [];
            this.selectedProvider = {
                label: ""
            };
            this.selectedProviderList = [];

            var provider = statusService.status.apiProvider;
            if (provider && provider.url && provider.serviceID) {
                seriesApiInterface.getServices(provider.url, provider.serviceID).then(provider => {
                    this.selectedProvider.label = provider.label;
                });
            }

            this.createProviderList = function() {
                this.selectedProviderList.length = 0;
                if (settingsService.aggregateServices && angular.isUndefined(statusService.status.apiProvider.url)) {
                    this.doForAllServices((provider, url) => {
                        this.selectedProviderList.push({
                            url: url,
                            serviceID: provider.id
                        });
                    });
                } else {
                    this.selectedProviderList.push(statusService.status.apiProvider);
                }
            };


            this.deleteProvider = function(provider) {
                removeProviderFromUserList(provider, this.providerList);
            };

            this.getAllProviders = function(platformType) {
                this.providerList = [];
                this.doForAllServices((provider, url) => {
                    provider.selected = isProviderSelected(provider, url);
                    if (provider.selected) this.selectedProvider.label = provider.label;
                    addToProviderList(provider, url, this.providerList);
                }, platformType);
                // initStatusProviderList();
                // statusService.status.addedProvider.forEach(entry => {
                //     seriesApiInterface.getServices(entry.url, entry.id, {
                //         platformTypes: platformType
                //     }).then(provider => {
                //         provider.selected = isProviderSelected(provider, entry.url);
                //         provider.isUserAdded = true;
                //         if (provider.selected) this.selectedProvider.label = provider.label;
                //         addToProviderList(provider, entry.url, this.providerList);
                //     });
                // });
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
                        this.createProviderList();
                        return;
                    } else {
                        provider.selected = false;
                    }
                });
                if (!selection) {
                    statusService.status.apiProvider = {};
                    this.createProviderList();
                    $rootScope.$emit('newProviderSelected');
                    return;
                }
            };

            this.addProvider = function(url) {
                return $q((resolve, reject) => {
                    seriesApiInterface.getServices(url)
                        .then(res => {
                            res.forEach(entry => {
                                entry.url = url;
                                addProviderToUserList(entry, this.providerList);
                            });
                            resolve();
                        }, () => {
                            reject();
                        });
                });
            };

            this.doForAllServices = function(doFunc, platformType) {
                var temp = Object.keys(settingsService.restApiUrls);
                temp.forEach(url => {
                    seriesApiInterface.getServices(url, null, {
                        platformTypes: platformType,
                        valueTypes: 'quantity'
                    }).then(providers => {
                        providers.forEach(provider => {
                            if (!this.isServiceBlacklisted(provider.id, url)) {
                                doFunc(provider, url, settingsService.restApiUrls[url]);
                            }
                        });
                    });
                });
                initStatusProviderList();
                statusService.status.addedProvider.forEach(entry => {
                    seriesApiInterface.getServices(entry.url, entry.id, {
                        platformTypes: platformType
                    }).then(provider => {
                        provider.isUserAdded = true;
                        doFunc(provider, entry.url);
                    });
                });
            };

            this.isServiceBlacklisted = function(serviceID, url) {
                var isBlacklisted = false;
                angular.forEach(settingsService.providerBlackList, function(entry) {
                    if (entry.serviceID === serviceID && entry.apiUrl === url) {
                        isBlacklisted = true;
                    }
                });
                return isBlacklisted;
            };
            this.createProviderList();
        }
    ]);
