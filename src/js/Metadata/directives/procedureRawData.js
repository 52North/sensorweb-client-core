angular.module('n52.core.metadata')
    .directive('swcProcedureRawdata', [
        function() {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    timeseries: '='
                },
                templateUrl: 'n52.core.metadata.procedure-rawdata',
                controller: 'SwcProcedureMetadataCtrl'
            };
        }
    ])
    .controller('SwcProcedureMetadataCtrl', ['$scope', '$window', 'procedureMetadataSrv',
        function($scope, $window, procedureMetadataSrv) {
            $scope.formatsList = [];

            $scope.select = function(choice) {
                var url = $scope.timeseries.apiUrl + 'procedures/' + $scope.timeseries.parameters.procedure.id + '?rawFormat=' + choice;
                $window.open(url);
            };

            $scope.toggled = function($event) {
                $event.preventDefault();
                $event.stopPropagation();
            };

            procedureMetadataSrv.getSupportedRawFormats($scope.timeseries, $scope.formatsList);
        }
    ])
    .factory('procedureMetadataSrv', ['seriesApiInterface',
        function(seriesApiInterface) {
            function getSupportedRawFormats(timeseries, list) {
                if (timeseries.parameters) {
                    var id = timeseries.parameters.procedure.id,
                        apiUrl = timeseries.apiUrl;
                    seriesApiInterface.getProcedures(id, apiUrl).then(function(data) {
                        angular.forEach(data.rawFormats, function(format) {
                            list.push(format);
                        });
                    });
                }
            }
            return {
                getSupportedRawFormats: getSupportedRawFormats
            };
        }
    ]);
