angular.module('n52.core.diagram')
    .controller('SwcChartCtrl', [
        '$scope',
        'diagramBehaviourService',
        'flotChartServ',
        'timeService',
        'styleService',
        'timeseriesService',
        function($scope, diagramBehaviourService, flotChartService, timeService, styleService, timeseriesService) {
            $scope.behaviour = diagramBehaviourService.behaviour;
            $scope.timeseries = timeseriesService.timeseries;
            $scope.data = timeseriesService.tsData;
            $scope.options = flotChartService.options;
            $scope.dataset = flotChartService.dataset;

            $scope.$watch('timeseries', (timeseries) => {
                flotChartService.timeseriesDataChanged(timeseries);
            }, true);

            $scope.$watch('data', () => {
                flotChartService.timeseriesDataChanged($scope.timeseries);
            }, true);

            $scope.$watch('behaviour', function(behaviour) {
                $scope.options.yaxis.show = behaviour.showYAxis;
            }, true);

            $scope.timeChanged = function(time) {
                timeService.setFlexibleTimeExtent(time.from, time.till);
            };

            $scope.seriesSelectionChanged = function(selection) {
                angular.forEach(selection, function(value, id) {
                    var ts = timeseriesService.getTimeseries(id);
                    styleService.setSelection(ts, value, true);
                });
                styleService.notifyAllTimeseriesChanged();
            };

        }
    ]);
