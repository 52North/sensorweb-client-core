var menuModule = angular.module('n52.core.menu', ['n52.core.timeseries', 'n52.core.status', 'n52.core.diagram', 'n52.core.table', 'n52.core.favorite'])
        .controller('menu', [
            '$scope',
            'timeseriesService',
            'statusService',
            'diagramBehaviourService',
            function ($scope, timeseriesService, statusService, diagramBehaviourService) {
                $scope.timeseries = timeseriesService.timeseries;
                var showYAxis = true;

                $scope.addTs = function () {
                    timeseriesService.addTimeseriesById("133", statusService.status.apiProvider.url);
                    timeseriesService.addTimeseriesById("186", statusService.status.apiProvider.url);
                };

                $scope.showYAxis = function () {
                    showYAxis = !showYAxis;
                    diagramBehaviourService.changeYAxis(showYAxis);
                };
            }])
        .controller('mainViewController', ['$scope', function ($scope) {
                $scope.tableVisible = false;

                $scope.toggleTable = function () {
                    $scope.tableVisible = !$scope.tableVisible;
                };
            }]);