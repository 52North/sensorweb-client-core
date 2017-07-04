require('../selection');
require('./service');
angular.module('n52.core.selection')
    .component('swcProviderSelector', {
        bindings: {
            providerList: '<',
            providerBlacklist: '<',
            supportStations: '<',
            selectedProvider: '<',
            filter: '<',
            providerSelected: "&onProviderSelected",
        },
        templateUrl: 'n52.core.provider.provider-selector',
        controller: ['providerSelectorService',
            function(providerSelectorService) {
                this.$onInit = function() {
                    var list = this.providerList;
                    if (!Array.isArray(list)) list = Object.keys(list);
                    this.loadingCount = list.length;
                    this.providers = [];
                    list.forEach(url => {
                        providerSelectorService.fetchProvidersOfAPI(url, this.providerBlacklist, this.filter)
                            .then(
                                res => {
                                    this.loadingCount--;
                                    if (res && res instanceof Array)
                                        res.forEach(entry => {
                                            if (entry.quantities.platforms > 0 || this.supportStations && entry.quantities.stations > 0) {
                                                this.providers.push(entry);
                                            }
                                        });
                                },
                                () => {
                                    this.loadingCount--;
                                }
                            );
                    });
                };
                this.selectProvider = function(provider) {
                    this.providerSelected({
                        provider: provider
                    });
                };
            }
        ]
    });
