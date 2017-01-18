angular.module('n52.core.listSelection')
    .directive('swcListSelection', [
        function() {
            return {
                restrict: 'E',
                templateUrl: 'n52.core.listSelection.list-selection',
                scope: {
                    parameters: '=',
                    listselectionid: '='
                },
                controller: 'SwcListSelectionCtrl'
            };
        }
    ])
    .controller('SwcListSelectionCtrl', ['$scope', 'seriesApiInterface', 'statusService', 'timeseriesService', '$rootScope', 'listSelectionSrvc', 'settingsService', 'providerService', 'serviceFinder', '$location',
        function($scope, seriesApiInterface, statusService, timeseriesService, $rootScope, listSelectionSrvc, settingsService, providerService, serviceFinder, $location) {
            angular.forEach($scope.parameters, function(param, openedIdx) {
                $scope.$watch('parameters[' + openedIdx + '].isOpen', function(newVal) {
                    if (newVal) {
                        $scope.selectedParameterIndex = openedIdx;
                        $scope.disableFollowingParameters();
                    }
                });
            });

            _clearSelection = function() {
                angular.forEach($scope.parameters, function(parameter) {
                    delete parameter.items;
                    delete parameter.selectedIdx;
                });
            };

            $rootScope.$on('newProviderSelected', function() {
                _clearSelection();
                $scope.openNext(0);
            });

            $scope.createParams = function(url, serviceID) {
                var params = {
                    service: serviceID
                };
                var temp;
                for (var i = 0; i < $scope.parameters.length; i++) {
                    if (angular.isNumber($scope.parameters[i].selectedIdx)) {
                        var selectedItem = $scope.parameters[i].items[$scope.parameters[i].selectedIdx];
                        if (selectedItem) {
                            for (var j = 0; j < selectedItem.provider.length; j++) {
                                if (selectedItem.provider[j].url === url && selectedItem.provider[j].serviceID === serviceID) {
                                    params[$scope.parameters[i].type] = selectedItem.provider[j].elemID;
                                    break;
                                }
                            }
                        }
                    } else {
                        temp = i;
                        break;
                    }
                }
                if (Object.keys(params).length === temp + 1 || Object.keys(params).length === 5) {
                    return params;
                } else {
                    return null;
                }
            };

            $scope.getItems = function(currParam) {
                currParam.items = [];
                if (currParam.type === 'category') {
                    $scope.requestItems(currParam, $scope.getCategories);
                } else if (currParam.type === 'feature') {
                    $scope.requestItems(currParam, $scope.getFeatures);
                } else if (currParam.type === 'phenomenon') {
                    $scope.requestItems(currParam, $scope.getPhenomena);
                } else if (currParam.type === 'procedure') {
                    $scope.requestItems(currParam, $scope.getProcedures);
                }
            };

            $scope.requestItems = function(currParam, itemsTypeFunc) {
                var paramConstellation;
                currParam.loading = 0;
                if (settingsService.aggregateServices && angular.isUndefined(statusService.status.apiProvider.url)) {
                    providerService.doForAllServices(function(provider, url) {
                        paramConstellation = $scope.createParams(url, provider.id);
                        if (paramConstellation) {
                            currParam.loading++;
                            itemsTypeFunc(url, provider.id, currParam, paramConstellation);
                        }
                    });
                } else {
                    var provider = statusService.status.apiProvider;
                    paramConstellation = $scope.createParams(provider.url, provider.serviceID);
                    if (paramConstellation) {
                        currParam.loading++;
                        itemsTypeFunc(provider.url, provider.serviceID, currParam, paramConstellation);
                    }
                }
            };

            $scope.getCategories = function(url, serviceID, currParam, params) {
                seriesApiInterface.getCategories(null, url, params).then(function(data) {
                    addEntries(data, serviceID, url, currParam);
                });
            };

            $scope.getFeatures = function(url, serviceID, currParam, params) {
                seriesApiInterface.getFeatures(null, url, params).then(function(data) {
                    addEntries(data, serviceID, url, currParam);
                });
            };

            $scope.getPhenomena = function(url, serviceID, currParam, params) {
                seriesApiInterface.getPhenomena(null, url, params).then(function(data) {
                    addEntries(data, serviceID, url, currParam);
                });
            };

            $scope.getProcedures = function(url, serviceID, currParam, params) {
                seriesApiInterface.getProcedures(null, url, params).then(function(data) {
                    addEntries(data, serviceID, url, currParam);
                });
            };

            addEntries = function(data, serviceID, url, currParam) {
                currParam.loading--;
                angular.forEach(data, function(entry) {
                    var categorie = {
                        serviceID: serviceID,
                        url: url,
                        elemID: entry.id
                    };
                    var idx;
                    for (var i = 0; i < currParam.items.length; i++) {
                        if (currParam.items[i].label.toUpperCase() === entry.label.toUpperCase()) {
                            idx = i;
                            break;
                        }
                    }
                    if (angular.isNumber(idx)) {
                        currParam.items[idx].provider.push(categorie);
                    } else {
                        var newEntry = {
                            label: entry.label,
                            provider: [categorie]
                        };
                        currParam.items.push(newEntry);
                    }
                    currParam.items.push();
                });
            };

            $scope.openNext = function(currentIdx) {
                $scope.parameters[currentIdx].isDisabled = false;
                $scope.selectedParameterIndex = currentIdx;
                if (currentIdx - 1 >= 0)
                    $scope.parameters[currentIdx - 1].isOpen = false;
                $scope.parameters[currentIdx].isOpen = true;
                $scope.getItems($scope.parameters[currentIdx]);
            };

            $scope.disableFollowingParameters = function() {
                angular.forEach($scope.parameters, function(param, idx) {
                    if (idx > $scope.selectedParameterIndex) {
                        param.isDisabled = true;
                        param.isOpen = false;
                        delete param.selectedIdx;
                        delete param.items;
                    }
                    if (idx >= $scope.selectedParameterIndex) {
                        delete param.headerAddition;
                    }
                });
            };

            $scope.openItem = function(item, paramIndex) {
                if (angular.isNumber(paramIndex))
                    $scope.selectedParameterIndex = paramIndex;
                $scope.disableFollowingParameters();
                $scope.addItem(item, $scope.selectedParameterIndex);
                $scope.deselectItems($scope.parameters[$scope.selectedParameterIndex].items);
                item.selected = true;
                if ($scope.selectedParameterIndex < $scope.parameters.length - 1) {
                    $scope.openNext($scope.selectedParameterIndex + 1);
                } else {
                    if (item.provider.length === 1) {
                        $scope.processSelection($scope.createParams(item.provider[0].url, item.provider[0].serviceID), item.provider[0].url);
                    }
                }
            };

            $scope.addItem = function(item, idx) {
                var parameters = $scope.parameters[idx];
                for (var i = 0; i < parameters.items.length; i++) {
                    if (parameters.items[i].label === item.label) {
                        parameters.selectedIdx = i;
                        break;
                    }
                }
                parameters.headerAddition = item.label;
            };

            $scope.deselectItems = function(items) {
                angular.forEach(items, function(item) {
                    item.selected = false;
                });
            };

            $scope.processSelection = function(params, url) {
                seriesApiInterface.getTimeseries(null, url, params).then(result => {
                    // TODO iterate over results
                    var dataset = result[0];
                    if (dataset.datasetType) {
                        serviceFinder.getDatasetPresenter(dataset.datasetType, dataset.seriesParameters.platform.platformType, url).presentDataset(dataset, url);
                    } else {
                        timeseriesService.addTimeseries(dataset);
                        $location.url('/diagram');
                    }
                });
            };

            if ($scope.listselectionid) {
                if (listSelectionSrvc.hasEntry($scope.listselectionid)) {
                    $scope.parameters = listSelectionSrvc.getEntry($scope.listselectionid);
                } else {
                    listSelectionSrvc.setEntry($scope.listselectionid, $scope.parameters);
                    $scope.openNext(0);
                }
            } else {
                $scope.openNext(0);
            }
        }
    ])
    .factory('listSelectionSrvc', ['$rootScope', function($rootScope) {
        var entries = {};
        getEntry = function(id) {
            return entries[id];
        };
        setEntry = function(id, entry) {
            entries[id] = entry;
        };
        hasEntry = function(id) {
            return angular.isDefined(entries[id]);
        };
        $rootScope.$on('newProviderSelected', function() {
            entries = {};
        });
        return {
            getEntry: getEntry,
            setEntry: setEntry,
            hasEntry: hasEntry
        };
    }]);
