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
            $scope.options = flotChartService.options;
            $scope.dataset = flotChartService.dataset;

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

            $scope.$watch('behaviour', function(behaviour) {
                $scope.options.yaxis.show = behaviour.showYAxis;
            }, true);
        }
    ]);
