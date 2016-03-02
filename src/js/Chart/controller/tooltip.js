angular.module('n52.core.tooltip', ['n52.core.time', 'n52.core.barChart'])
        .controller('SwcTooltipCtrl', ['$scope',
            function ($scope) {
                $scope.$apply();
            }]);

(function ($) {
    function init(plot) {
        if ($("#tooltip").length === 0) {
            $("<div id='tooltip'></div>").appendTo("body");
            $("#tooltip").load("templates/diagram/tooltip.html");
        }

        function plothover(event, pos, item) {
            if (item) {
                $("#tooltip").each(function () {
                    var content = $(this);
                    angular.element(document).injector().invoke(['$compile', 'timeseriesService',
                        function ($compile, timeseriesService) {
                            var scope = angular.element(content).scope();
                            scope.timeseries = timeseriesService.getTimeseries(item.series.id);
                            scope.time = item.datapoint[0].toFixed(0);
                            scope.value = item.datapoint[1].toFixed(2);
                            $compile(content)(scope);
                        }]);
                });
                var halfwidth = event.target.clientWidth / 2;
                var tooltip = $("#tooltip").show();
                if (halfwidth >= item.pageX) {
                    tooltip.css({top: item.pageY + 5, left: item.pageX + 5, right: "auto"});
                } else {
                    tooltip.css({top: item.pageY + 5, right: ($(window).width() - item.pageX), left: "auto"});
                }
            } else {
                $("#tooltip").hide();
            }
        }
        
        function shutdown(plot) {
            $(plot.getPlaceholder()).unbind("plothover", plothover);
        }

        function bindEvents(plot) {
            $(plot.getPlaceholder()).bind("plothover", plothover);
        }
        plot.hooks.bindEvents.push(bindEvents);
        plot.hooks.shutdown.push(shutdown);
    }
    $.plot.plugins.push({
        init: init,
        name: 'tooltip',
        version: '1.3'
    });
})(jQuery);