angular.module('n52.core.menu')
        .controller('SwcMenuCtrl', [
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
            }]);

        // TODO can be removed?
