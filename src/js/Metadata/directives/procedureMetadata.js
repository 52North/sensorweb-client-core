angular.module('n52.core.metadata')
        .directive('swcProcedureMetadata', [function () {
                return {
                    restrict: 'E',
                    replace: true,
                    scope: {
                        timeseries: '='
                    },
                    templateUrl: 'n52.core.metadata.procedure-button',
                    controller: ['$scope', 'modalOpener', 'procedureMetadataSrv',
                        function ($scope, modalOpener, procedureMetadataSrv) {
                            $scope.formatsList = [];
                            procedureMetadataSrv.getSupportedRawFormats($scope.timeseries, $scope.formatsList);

                            $scope.open = function () {
                                modalOpener.open({
                                    templateUrl: 'n52.core.metadata.procedure-modal',
                                    resolve: {
                                        timeseries: function () {
                                            return $scope.timeseries;
                                        }
                                    },
                                    controller: ['$scope', '$uibModalInstance', 'timeseries', '$http',
                                        function ($scope, $uibModalInstance, timeseries, $http) {
                                            $scope.timeseries = timeseries;
                                            var procedureURL = timeseries.apiUrl + 'procedures/' + timeseries.parameters.procedure.id + '?rawFormat=http://www.opengis.net/sensorml/2.0';
                                            $http.get(procedureURL).then(function (response) {
                                                var xml = response.data;
                                                $http.get('xslt/procedure.xsl').then(function (xsl) {
                                                    $scope.result = xslt(xml, xsl.data);
                                                });
                                            });
                                            $scope.close = function () {
                                                $uibModalInstance.close();
                                            };
                                        }]
                                });
                            };
                        }]
                };
            }]);
