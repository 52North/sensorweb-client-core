angular.module('n52.core.diagram', ['n52.core.timeseries', 'n52.core.time', 'n52.core.flot', 'n52.core.timeSelectorButtons', 'n52.core.settings', 'n52.core.yAxisHide'])
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
angular.module('n52.core.flot', ['n52.core.time', 'n52.core.barChart'])
        .directive('flot', ['timeService', '$window', '$log', 'flotService', '$translate', 'timeseriesService', 'styleService',
            function (timeService, $window, $log, flotService, $translate, timeseriesService, styleService) {

                function plotPanEnd(evt, plot) {
                    var xaxis = plot.getXAxes()[0];
                    var from = moment(xaxis.min);
                    var till = moment(xaxis.max);
                    timeService.setFlexibleTimeExtent(from, till);
                }

                return {
                    restrict: 'EA',
                    template: '<div></div>',
                    scope: {
                        dataset: '=',
                        options: '=',
                        callback: '='
                    },
                    link: function (scope, element, attributes) {
                        var height, init, onDatasetChanged, onOptionsChanged, plot, plotArea, width, _ref, _ref1, dataset;
                        plot = null;
                        width = attributes.width || '100%';
                        height = attributes.height || '100%';
                        if (((_ref = scope.options) !== null ? (_ref1 = _ref.legend) !== null ? _ref1.container : void 0 : void 0) instanceof jQuery) {
                            throw 'Please use a jQuery expression string with the "legend.container" option.';
                        }

                        if (!dataset) {
                            dataset = flotService.createDataSet();
                        }
                        if (!scope.options) {
                            scope.options = {
                                legend: {
                                    show: false
                                }
                            };
                        }

                        plotArea = $(element.children()[0]);
                        plotArea.css({
                            width: width,
                            height: height
                        });

                        $(plotArea).bind('plotpanEnd', plotPanEnd);

                        /* tooltips for mouse position */
//                    $("<div id='tooltip'></div>").css({
//                        position: "absolute",
//                        display: "none",
//                        border: "1px solid #fdd",
//                        padding: "2px",
//                        "background-color": "#fee",
//                        opacity: 0.80
//                    }).appendTo("body");
//
//                    $(plotArea).bind("plothover", function (event, pos, item) {
//                        debugger;
//                        if (item) {
//                            var x = item.datapoint[0].toFixed(2),
//                                    y = item.datapoint[1].toFixed(2);
//
//                            $("#tooltip").html(item.series.label + " of " + x + " = " + y)
//                                    .css({top: item.pageY + 5, left: item.pageX + 5})
//                                    .fadeIn(200);
//                        } else {
//                            $("#tooltip").hide();
//                        }
//                    });
                        /* tooltip for mouse position */

                        scope.$on('timeseriesChanged', function (evt, id) {
                            flotService.updateTimeseriesInDataSet(dataset, id);
                            initNewPlot();
                        });

                        scope.$on('allTimeseriesChanged', function (evt) {
                            flotService.updateAllTimeseriesToDataSet(dataset);
                            initNewPlot();
                        });

                        scope.$on('timeseriesDataChanged', function (evt, id) {
                            flotService.updateTimeseriesInDataSet(dataset, id);
                            initNewPlot();
                        });

//                    updatePlot = function () {
//                        $log.info('angular flot dataset changed');
//                        if (plot) {
//                            plot.setData(dataset);
//                            plot.setupGrid();
//
//                            // deselect all axes
//                            $.each($('.axisTarget'), function (idx, axis) {
//                                $(axis).removeClass('selected');
//                            });
//
//                            // select the axes
//                            $.each(plot.getData(), function (index, elem) {
//                                if (elem.selected) {
//                                    $.each($('.axisTarget'), function () {
//                                        if ($(this).data('axis.n') === elem.yaxis.n) {
//                                            if (!$(this).hasClass('selected')) {
//                                                $(this).addClass('selected');
//                                                return false;
//                                            }
//                                        }
//                                    });
//                                }
//                            });
//                            return plot.draw();
//                        } else {
//                            $log.info('plot init');
//                            return plot = initNewPlot();
//                        }
//                    };

                        initNewPlot = function () {
//                            $log.info('plot chart');
                            if (dataset.length !== 0) {
                                var plotObj = $.plot(plotArea, dataset, scope.options);
                                createPlotAnnotation();
                                createYAxis(plotObj);
                                return plotObj; // TODO is this needed?
                            }
                        };

                        createPlotAnnotation = function () {
                            plotArea.append("<div class='chart-annotation'>" + $translate.instant('chart.annotation') + "</div>");
                        };

                        createYAxis = function (plot) {
                            // remove old labels
                            $('.yaxisLabel').remove();

                            // createYAxis
                            $.each(plot.getAxes(), $.proxy(function (i, axis) {
                                if (!axis.show)
                                    return;
                                var box = axis.box;
                                if (axis.direction === "y") {
                                    $("<div class='axisTarget' style='position:absolute; left:" + box.left + "px; top:" + box.top + "px; width:" + box.width + "px; height:" + box.height + "px'></div>")
                                            .data("axis.n", axis.n)
                                            .appendTo(plot.getPlaceholder())
                                            .click($.proxy(function (event) {
                                                var target = $(event.currentTarget);
                                                var selected = false;
                                                $.each($('.axisTarget'), function (index, elem) {
                                                    elem = $(elem);
                                                    if (target.data('axis.n') === elem.data('axis.n')) {
                                                        selected = elem.hasClass("selected");
                                                        return false; // break loop
                                                    }
                                                });
                                                $.each(plot.getData(), function (index, elem) {
                                                    var ts = timeseriesService.getTimeseries(elem.id);
                                                    if (target.data('axis.n') === elem.yaxis.n) {
                                                        styleService.setSelection(ts, !selected, true);
                                                    } else {
                                                        styleService.setSelection(ts, false, true);
                                                    }
                                                });
                                                if (!selected) {
                                                    target.addClass("selected");
                                                }
                                                styleService.notifyAllTimeseriesChanged();
                                            }, this));
                                    var yaxisLabel = $("<div class='axisLabel yaxisLabel' style=left:" + box.left + "px;></div>").text(axis.options.uom).appendTo('#placeholder');
                                    if (axis.options.tsColors) {
                                        $.each(axis.options.tsColors, function (idx, color) {
                                            $('<span>').html('&nbsp;&#x25CF;').css('color', color).addClass('labelColorMarker').appendTo(yaxisLabel);
                                        });
                                    }
                                    yaxisLabel.css("margin-left", -(yaxisLabel.width() - yaxisLabel.height()) / 2 - 3);
                                }
                            }, this));

                            // set selection to axis
                            $.each(plot.getData(), function (index, elem) {
                                if (elem.selected) {
                                    $.each($('.axisTarget'), function () {
                                        if ($(this).data('axis.n') === elem.yaxis.n) {
                                            if (!$(this).hasClass('selected')) {
                                                $(this).addClass('selected');
                                                return false;
                                            }
                                        }
                                    });
                                }
                            });
                        };

                        onOptionsChanged = function () {
                            flotService.updateAllTimeseriesToDataSet(dataset);
                            plot = initNewPlot();
                        };
                        scope.$watch('options', onOptionsChanged, true);

                        // plot new when resize
                        angular.element($window).bind('resize', initNewPlot);
                    }
                };
            }])
        .factory('flotService', ['timeseriesService', 'settingsService', 'barChartHelperService',
            function (timeseriesService, settingsService, barChartHelperService) {

                updateAllTimeseriesToDataSet = function (dataset) {
                    angular.forEach(timeseriesService.getAllTimeseries(), function (ts) {
                        updateTimeseriesInDataSet(dataset, ts.internalId);
                    });
                };

                updateTimeseriesInDataSet = function (dataset, id) {
                    removeTimeseriesFromDataSet(dataset, id);
                    addTimeseriesToDataSet(dataset, id);
                };

                addTimeseriesToDataSet = function (dataset, id) {
                    if (timeseriesService.isTimeseriesVisible(id)) {
                        var data = timeseriesService.getData(id);
                        var ts = timeseriesService.getTimeseries(id);
                        if (data && data.values) {
                            var dataEntry = createEntry(ts, data);
                            dataset.push(dataEntry);
                        }
                        // add possible ref values
                        angular.forEach(timeseriesService.getTimeseries(id).referenceValues, function (refValue) {
                            if (refValue.visible) {
                                var data = timeseriesService.getData(id);
                                if (data && data.referenceValues) {
                                    dataset.push({
                                        id: refValue.referenceValueId,
                                        color: refValue.color,
                                        data: timeseriesService.getData(id).referenceValues[refValue.referenceValueId]
                                    });
                                }
                            }
                        });
                    }
                };

                createEntry = function (ts, data) {
                    // general data settings
                    var dataEntry = {
                        id: ts.internalId,
                        color: ts.styles.color,
                        data: data.values,
                        selected: ts.styles.selected,
                        lines: {
                            lineWidth: ts.styles.selected ? settingsService.selectedLineWidth : settingsService.commonLineWidth
                        },
                        bars: {
                            lineWidth: ts.styles.selected ? settingsService.selectedLineWidth : settingsService.commonLineWidth
                        },
                        yaxis: ts.styles.yaxis
                    };
                    // bar chart
                    if (ts.renderingHints && ts.renderingHints.chartType && ts.renderingHints.chartType === "bar") {
                        var interval = ts.renderingHints.properties.interval;
                        dataEntry.bars = {
                            show: true,
                            barWidth: barChartHelperService.intervalToHour(interval) * 60 * 60 * 1000
                        };
                        dataEntry.lines = {
                            show: false
                        };
                        dataEntry.data = barChartHelperService.sumForInterval(data.values, interval);
                    } else {
                        dataEntry.data = data.values;
                    }
                    return dataEntry;
                };

                createDataSet = function () {
                    var dataset = [];
                    if (timeseriesService.getTimeseriesCount() > 0) {
                        angular.forEach(timeseriesService.timeseries, function (elem) {
                            addTimeseriesToDataSet(dataset, elem.id);
                        });
                    }
                    return dataset;
                };

                removeTimeseriesFromDataSet = function (dataset, id) {
                    removeData(dataset, id);
                    if (timeseriesService.getTimeseries(id)) {
                        angular.forEach(timeseriesService.getTimeseries(id).referenceValues, function (refValue) {
                            removeData(dataset, refValue.referenceValueId);
                        });
                    }
                };

                removeData = function (dataset, id) {
                    var idx;
                    angular.forEach(dataset, function (elem, i) {
                        if (elem.id === id)
                            idx = i;
                    });
                    if (idx >= 0)
                        dataset.splice(idx, 1);
                };

                return {
                    updateTimeseriesInDataSet: updateTimeseriesInDataSet,
                    updateAllTimeseriesToDataSet: updateAllTimeseriesToDataSet,
                    createDataSet: createDataSet
                };
            }]);

angular.module('n52.core.yAxisHide', ['n52.core.timeseries'])
        .directive('yAxisHideButton', ['diagramBehaviourService',
            function (diagramBehaviourService) {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/diagram/y-axis-hide-button.html',
                    controller: ['$scope', function ($scope) {
                        $scope.behaviour = diagramBehaviourService.behaviour;

                        $scope.toggleYAxis = function () {
                            diagramBehaviourService.toggleYAxis();
                        };
                    }]
                };
            }]);