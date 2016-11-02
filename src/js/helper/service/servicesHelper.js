angular.module('n52.core.helper')
    .service('servicesHelper', ['interfaceService', 'settingsService',
        function(interfaceService, settingsService) {

            this.doForAllServices = function(doFunc, platformType) {
                var temp = Object.keys(settingsService.restApiUrls);
                temp.forEach(url => {
                    interfaceService.getServices(url, null, {
                        platformTypes: platformType
                    }).then(providers => {
                        providers.forEach(provider => {
                            if (!this.isServiceBlacklisted(provider.id, url)) {
                                doFunc(provider, url, settingsService.restApiUrls[url]);
                            }
                        });
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
        }
    ]);
