angular.module('n52.core.provider', [])
    .service('providerService', ['$rootScope', 'statusService', 'servicesHelper',
        function($rootScope, statusService, servicesHelper) {
            this.providerList = [];
            this.selectedProvider = {
                label: ""
            };

            this.getAllProviders = function(platformType) {
                this.providerList = [];
                servicesHelper.doForAllServices((provider, url) => {
                    if (url === statusService.status.apiProvider.url && statusService.status.apiProvider.serviceID === provider.id) {
                        provider.selected = true;
                        this.selectedProvider.label = provider.label;
                    } else {
                        provider.selected = false;
                    }
                    provider.url = url;
                    this.providerList.push(provider);
                }, platformType);
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
        }
    ]);
