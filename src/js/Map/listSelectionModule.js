angular.module('n52.core.listSelection', ['n52.core.interface', 'n52.core.status'])
        .controller('ListSelectionButtonCtrl', ['$scope', '$modal',
            function ($scope, $modal) {
                $scope.openListSelection = function () {
                    $modal.open({
                        animation: true,
                        templateUrl: 'templates/listSelection/modal-list-selection.html',
                        controller: 'ModalListSelectionCtrl'
                    });
                };
            }])
        .controller('ModalListSelectionCtrl', ['$scope', '$modalInstance',
            function ($scope, $modalInstance) {
                $scope.modalInstance = $modalInstance;

                $scope.categoryParams = [
                    {
                        type: 'category',
                        header: 'listSelection.headers.category'
                    },
                    {
                        type: 'feature',
                        header: 'listSelection.headers.station'
                    },
                    {
                        type: 'phenomenon',
                        header: 'listSelection.headers.phenomenon'
                    },
                    {
                        type: 'procedure',
                        header: 'listSelection.headers.procedure'
                    }
                ];

                $scope.stationParams = [
                    {
                        type: 'feature',
                        header: 'listSelection.headers.station'
                    },
                    {
                        type: 'category',
                        header: 'listSelection.headers.category'
                    },
                    {
                        type: 'phenomenon',
                        header: 'listSelection.headers.phenomenon'
                    },
                    {
                        type: 'procedure',
                        header: 'listSelection.headers.procedure'
                    }
                ];

                $scope.phenomenonParams = [
                    {
                        type: 'phenomenon',
                        header: 'listSelection.headers.phenomenon'
                    },
                    {
                        type: 'category',
                        header: 'listSelection.headers.category'
                    },
                    {
                        type: 'feature',
                        header: 'listSelection.headers.station'
                    },
                    {
                        type: 'procedure',
                        header: 'listSelection.headers.procedure'
                    }
                ];

                $scope.close = function () {
                    $modalInstance.close();
                };
            }])
        .directive('swcListSelection', ['interfaceService', 'statusService', 'timeseriesService', '$location',
            function (interfaceService, statusService, timeseriesService, $location) {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/listSelection/accordion-list-selection.html',
                    scope: {
                        parameters: '='
                    },
                    controller: ['$scope', function ($scope) {
                        angular.forEach($scope.parameters, function (param, openedIdx) {
                            $scope.$watch('parameters[' + openedIdx + '].isOpen', function (newVal, oldVal) {
                                if (newVal) {
                                    $scope.selectedParameterIndex = openedIdx;
                                    // TODO nachfolger disablen und zurücksetzen
                                    angular.forEach($scope.parameters, function (param, idx) {
                                        if (idx > openedIdx) {
                                            param.isDisabled = true;
                                            delete param.selectedId;
                                            delete param.items;
                                        }
                                        if (idx >= openedIdx) {
                                            delete param.headerAddition;
                                        }
                                    });
                                }
                            });
                        });

                        $scope.createParams = function () {
                            var params = {
                                service: statusService.status.apiProvider.serviceID
                            };
                            angular.forEach($scope.parameters, function (parameter) {
                                if (parameter.selectedId) {
                                    params[parameter.type] = parameter.selectedId;
                                }
                            });
                            return params;
                        };

                        $scope.getItems = function (currParam) {
                            if (currParam.type === 'category') {
                                interfaceService.getCategories(null, statusService.status.apiProvider.url, $scope.createParams()).success(function (data) {
                                    currParam.items = data;
                                });
                            } else if (currParam.type === 'feature') {
                                interfaceService.getFeatures(null, statusService.status.apiProvider.url, $scope.createParams()).success(function (data) {
                                    currParam.items = data;
                                });
                            } else if (currParam.type === 'phenomenon') {
                                interfaceService.getPhenomena(null, statusService.status.apiProvider.url, $scope.createParams()).success(function (data) {
                                    currParam.items = data;
                                });
                            } else if (currParam.type === 'procedure') {
                                interfaceService.getProcedures(null, statusService.status.apiProvider.url, $scope.createParams()).success(function (data) {
                                    currParam.items = data;
                                });
                            }
                        };

                        $scope.openNext = function (idx) {
                            $scope.parameters[idx].isDisabled = false;
                            $scope.selectedParameterIndex = idx;
                            $scope.parameters[idx].isOpen = true;
                            $scope.getItems($scope.parameters[idx]);
                        };

                        $scope.openItem = function (item) {
                            $scope.parameters[$scope.selectedParameterIndex].selectedId = item.id;
                            $scope.parameters[$scope.selectedParameterIndex].headerAddition = item.label;
                            if ($scope.selectedParameterIndex < $scope.parameters.length - 1) {
                                $scope.openNext($scope.selectedParameterIndex + 1);
                            } else {
                                timeseriesService.addTimeseriesById(null, statusService.status.apiProvider.url, $scope.createParams());
                                $location.url('/diagram');
                                $scope.$parent.modalInstance.close();
                            }
                        };

                        $scope.openNext(0);
                    }]
                };
            }]);
