angular.module('n52.core.helper')
    .factory('servicesHelper', ['interfaceService', 'settingsService',
        function(interfaceService, settingsService) {

            function doForAllServices(doFunc, platformType) {
                angular.forEach(settingsService.restApiUrls, function(internalID, url) {
                    interfaceService.getServices(url, null, {
                        platformTypes: platformType
                    }).then(function(providers) {
                        angular.forEach(providers, function(provider) {
                            if (!isServiceBlacklisted(provider.id, url)) {
                                doFunc(provider, url, internalID);
                            }
                        });
                    });
                });
            }

            function isServiceBlacklisted(serviceID, url) {
                var isBlacklisted = false;
                angular.forEach(settingsService.providerBlackList, function(entry) {
                    if (entry.serviceID === serviceID && entry.apiUrl === url) {
                        isBlacklisted = true;
                    }
                });
                return isBlacklisted;
            }

            return {
                doForAllServices: doForAllServices,
                isServiceBlacklisted: isServiceBlacklisted
            };
        }
    ]);
