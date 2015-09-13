angular.module('providerModule', ['interfaceModule', 'statusModule'])
        .controller('ProviderButtonCtrl', ['$scope', '$modal',
            function ($scope, $modal) {
                $scope.selectProvider = function () {
                    // open provider list in modal window
                    $modal.open({
                        animation: true,
                        templateUrl: 'templates/map/provider-list-modal.html',
                        controller: 'ProviderListModalCtrl'
                    });
                };
            }])
        .controller('ProviderListModalCtrl', ['$scope', '$modalInstance', 'providerService',
            function ($scope, $modalInstance, providerService) {
                $scope.providerList = providerService.providerList;

                $scope.close = function () {
                    $modalInstance.close();
                };

                $scope.selectProvider = function (provider) {
                    providerService.selectProvider(provider);
                    $modalInstance.close();
                };
            }])
        .factory('providerService', ['$rootScope', 'settingsService', 'interfaceService', 'statusService',
            function ($rootScope, settingsService, interfaceService, statusService) {
                var providerList = [];

                var getAllProviders = function () {
                    angular.forEach(settingsService.restApiUrls, function (elem, url) {
                        interfaceService.getServices(url).success(function (providers) {
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

                var selectProvider = function (selection) {
                    angular.forEach(providerList, function (provider) {
                        if (selection.id === provider.id && selection.url === provider.url) {
                            provider.selected = true;
                            statusService.status.apiProvider = {
                                url: provider.url,
                                serviceID: provider.id
                            };
                            $rootScope.$emit('newProviderSelected');
                        } else {
                            provider.selected = false;
                        }
                    });
                };

                getAllProviders();

                return {
                    providerList: providerList,
                    selectProvider: selectProvider
                };
            }]);