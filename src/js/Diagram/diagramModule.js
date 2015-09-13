angular.module('diagramModule', ['timeseriesModule', 'timeModule', 'flotModule', 'timeSelectorButtonsModule', 'settingsModule', 'yAxisHideModule'])
        .controller('chartController', ['$scope', 'timeseriesService', 'timeService', 'diagramBehaviourService', '$log', '$rootScope', 'settingsService',
            function ($scope, timeseriesService, timeService, diagramBehaviourService, $log, $rootScope, settingsService) {
                $log.info('start chart controller');

                var defaultOptions = {
                    series: {
                        downsample: {
                            threshold: 0
                        },
                        lines: {
                            show: true,
                            fill: false
                        },
//            points : {
//                show: true
//            },
                        shadowSize: 1
                    },
                    selection: {
                        mode: "xy"
                    },
                    grid: {
                        hoverable: true,
                        autoHighlight: false
                    },
                    crosshair: {
                        mode: 'x'
                    },
                    xaxis: {
                        mode: "time",
                        timezone: "browser",
//            monthNames: _("chart.monthNames")
//            timeformat: "%Y/%m/%d",
                        //use these the following two lines to have small ticks at the bottom ob the diagram
//            tickLength: 5,
//            tickColor: "#000"
                    },
                    yaxis: {
                        show: true,
                        additionalWidth: 17,
                        panRange: false,
                        min: null,
                        labelWidth: 50
//			tickFormatter : function(val, axis) {
//				var factor = axis.tickDecimals ? Math.pow(10, axis.tickDecimals) : 1;
//				var formatted = "" + Math.round(val * factor) / factor;
//				return formatted + "<br>" + this.uom;
//			}
                    },
                    legend: {
                        show: false
                    },
                    pan: {
                        interactive: true,
                        frameRate: 10
                    }
                };
                angular.merge(defaultOptions, settingsService.chartOptions);

                $scope.timeseries = timeseriesService.timeseries;
                $scope.behaviour = diagramBehaviourService.behaviour;

                $scope.options = defaultOptions;

                setTimeExtent();

                $rootScope.$on('timeExtentChanged', function (evt, id) {
                    setTimeExtent();
                });

                function setTimeExtent() {
                    $scope.options.xaxis.min = timeService.time.start.toDate().getTime();
                    $scope.options.xaxis.max = timeService.time.end.toDate().getTime();
                }

                function onTimeseriesChanged(timeseries) {
                    $scope.options.yaxes = createYAxis(timeseries);
                }

                function createYAxis(timeseries) {
                    var axesList = {};
                    angular.forEach(timeseries, function (elem) {
                        if (elem.styles.groupedAxis === undefined || elem.styles.groupedAxis) {
                            if (!axesList.hasOwnProperty(elem.uom)) {
                                axesList[elem.uom] = {
                                    id: ++Object.keys(axesList).length,
                                    uom: elem.uom,
                                    tsColors: [elem.styles.color],
                                    zeroScaled: elem.styles.zeroScaled
                                };
                                elem.styles.yaxis = axesList[elem.uom].id;
                            } else {
                                axesList[elem.uom].tsColors.push(elem.styles.color);
                                elem.styles.yaxis = axesList[elem.uom].id;
                            }
                        } else {
                            axesList[elem.id] = {
                                id: ++Object.keys(axesList).length,
                                uom: elem.uom + " @ " + elem.station.properties.label,
                                tsColors: [elem.styles.color],
                                zeroScaled: elem.styles.zeroScaled
                            };
                            elem.yaxis = axesList[elem.id].id;
                        }
                    });
                    var axes = [];
                    angular.forEach(axesList, function (elem) {
                        axes.splice(elem.id - 1, 0, {
                            uom: elem.uom,
                            tsColors: elem.tsColors,
                            min: elem.zeroScaled ? 0 : defaultOptions.yaxis.min
                        });
                    });
                    return axes;
                }

                $scope.$watch('timeseries', onTimeseriesChanged, true);

                $scope.$watch('behaviour', function (behaviour) {
                    $scope.options.yaxis.show = behaviour.showYAxis;
                }, true);

                $log.info('end chart controller');
            }])
        .factory('diagramBehaviourService', function () {
            var behaviour = {};
            behaviour.showYAxis = true;

            function toggleYAxis() {
                behaviour.showYAxis = !behaviour.showYAxis;
            }

            return {
                behaviour: behaviour,
                toggleYAxis: toggleYAxis
            };
        });