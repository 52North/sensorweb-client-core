angular.module('n52.core.selection')
    .service('providerSelectorService', ['seriesApiInterface', '$q',
        function(seriesApiInterface, $q) {

            var isServiceBlacklisted = (serviceID, url, blacklist) => {
                var isBlacklisted = false;
                blacklist.forEach(entry => {
                    if (entry.serviceID === serviceID && entry.apiUrl === url) {
                        isBlacklisted = true;
                    }
                });
                return isBlacklisted;
            };

            this.fetchProvidersOfAPI = (url, blacklist, filter) => {
                return $q((resolve, reject) => {
                    seriesApiInterface.getServices(url, null, filter)
                        .then(providers => {
                                if (providers && providers instanceof Array)
                                    var usableProviders = providers.map((provider) => {
                                        if (!isServiceBlacklisted(provider.id, url, blacklist)) {
                                            provider.providerUrl = url;
                                            return provider;
                                        }
                                    });
                                resolve(usableProviders);
                            },
                            error => reject(error)
                        );
                });
            };
        }
    ]);
