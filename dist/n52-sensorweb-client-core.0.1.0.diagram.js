angular.module('n52.core.diagram', ['n52.core.time', 'n52.core.flot', 'n52.core.timeSelectorButtons', 'n52.core.settings', 'n52.core.yAxisHide'])
        .controller('chartCtrl', ['$scope', 'diagramBehaviourService', 'flotChartServ',
            function ($scope, diagramBehaviourService, flotChartService) {
                $scope.behaviour = diagramBehaviourService.behaviour;
                $scope.options = flotChartService.options;
                $scope.dataset = flotChartService.dataset;

                $scope.$watch('behaviour', function (behaviour) {
                    $scope.options.yaxis.show = behaviour.showYAxis;
                }, true);
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
        })
        // this factory handles flot chart conform datasets
        .factory('flotChartServ', ['timeseriesService', 'timeService', 'settingsService', 'flotDataHelperServ', '$rootScope',
            function (timeseriesService, timeService, settingsService, flotDataHelperServ, $rootScope) {
                var options = {
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
                        mode: null
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
                        timezone: "browser"
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
                angular.merge(options, settingsService.chartOptions);
                var dataset = createDataSet();
                var renderOptions = {
                    showRefValues: true,
                    showSelection: true
                };
                setTimeExtent();

                $rootScope.$on('timeseriesChanged', function (evt, id) {
                    createYAxis();
                    flotDataHelperServ.updateTimeseriesInDataSet(dataset, renderOptions, id, timeseriesService.getData(id));
                });

                $rootScope.$on('allTimeseriesChanged', function () {
                    createYAxis();
                    flotDataHelperServ.updateAllTimeseriesToDataSet(dataset, renderOptions, timeseriesService.getAllTimeseries());
                });

                $rootScope.$on('timeseriesDataChanged', function (evt, id) {
                    createYAxis();
                    flotDataHelperServ.updateTimeseriesInDataSet(dataset, renderOptions, id, timeseriesService.getData(id));
                });

                $rootScope.$on('timeExtentChanged', function () {
                    setTimeExtent();
                });

                function setTimeExtent() {
                    options.xaxis.min = timeService.time.start.toDate().getTime();
                    options.xaxis.max = timeService.time.end.toDate().getTime();
                }

                function createYAxis() {
                    var axesList = {};
                    angular.forEach(timeseriesService.getAllTimeseries(), function (elem) {
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
                            min: elem.zeroScaled ? 0 : options.yaxis.min
                        });
                    });
                    options.yaxes = axes;
                }

                function createDataSet() {
                    var dataset = [];
                    if (timeseriesService.getTimeseriesCount() > 0) {
                        angular.forEach(timeseriesService.timeseries, function (elem) {
                            flotDataHelperServ.addTimeseriesToDataSet(dataset, renderOptions, elem.id, timeseriesService.getData(elem.id));
                        });
                    }
                    return dataset;
                }

                return {
                    dataset: dataset,
                    options: options
                };
            }])
        .factory('flotDataHelperServ', ['timeseriesService', 'settingsService', 'barChartHelperService',
            function (timeseriesService, settingsService, barChartHelperService) {
                function updateAllTimeseriesToDataSet(dataset, renderOptions, timeseriesList) {
                    angular.forEach(timeseriesList, function (ts) {
                        updateTimeseriesInDataSet(dataset, renderOptions, ts.internalId, timeseriesService.getData(ts.internalId));
                    });
                }

                function updateTimeseriesInDataSet(dataset, renderOptions, id, data) {
                    removeTimeseriesFromDataSet(dataset, id);
                    addTimeseriesToDataSet(dataset, renderOptions, id, data);
                }

                function addTimeseriesToDataSet(dataset, renderOptions, id, data) {
                    if (timeseriesService.isTimeseriesVisible(id)) {
                        var ts = timeseriesService.getTimeseries(id);
                        if (data && data.values) {
                            var dataEntry = createEntry(ts, data, renderOptions);
                            dataset.push(dataEntry);
                        }
                        // add possible ref values
                        if (renderOptions.showRefValues) {
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
                    }
                }

                function createEntry(ts, data, renderOptions) {
                    // general data settings
                    var selected = ts.styles.selected && renderOptions.showSelection,
                    dataEntry = {
                        id: ts.internalId,
                        color: ts.styles.color,
                        data: data.values,
                        selected: selected,
                        lines: {
                            lineWidth: selected ? settingsService.selectedLineWidth : settingsService.commonLineWidth
                        },
                        bars: {
                            lineWidth: selected ? settingsService.selectedLineWidth : settingsService.commonLineWidth
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
                }

                function removeTimeseriesFromDataSet(dataset, id) {
                    removeData(dataset, id);
                    if (timeseriesService.getTimeseries(id)) {
                        angular.forEach(timeseriesService.getTimeseries(id).referenceValues, function (refValue) {
                            removeData(dataset, refValue.referenceValueId);
                        });
                    }
                }

                function removeData(dataset, id) {
                    var idx;
                    angular.forEach(dataset, function (elem, i) {
                        if (elem.id === id)
                            idx = i;
                    });
                    if (idx >= 0)
                        dataset.splice(idx, 1);
                }

                return {
                    updateAllTimeseriesToDataSet: updateAllTimeseriesToDataSet,
                    updateTimeseriesInDataSet: updateTimeseriesInDataSet
                };
            }]);
angular.module('n52.core.flot', ['n52.core.time', 'n52.core.barChart'])
        .directive('flot', ['timeService', '$window', '$translate', 'timeseriesService', 'styleService',
            function (timeService, $window, $translate, timeseriesService, styleService) {
                return {
                    restrict: 'EA',
                    template: '<div></div>',
                    scope: {
                        dataset: '=',
                        options: '='
                    },
                    link: function (scope, element, attributes) {
                        var height, plot, plotArea, width, _ref, _ref1;
                        plot = null;
                        width = attributes.width || '100%';
                        height = attributes.height || '100%';
                        if (((_ref = scope.options) !== null ? (_ref1 = _ref.legend) !== null ? _ref1.container : void 0 : void 0) instanceof jQuery) {
                            throw 'Please use a jQuery expression string with the "legend.container" option.';
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

                        initNewPlot = function (plotArea, dataset, options) {
                            if (dataset && dataset.length !== 0) {
                                var plotObj = $.plot(plotArea, dataset, options);
                                createPlotAnnotation();
                                createYAxis(plotObj);
                                setSelection(plotObj, options);
                            } else {
                                plotArea.empty();
                                $('.axisLabel').remove();
                            }
                        };

                        setSelection = function (plot, options) {
                            if (plot && options.selection.range) {
                                plot.setSelection({
                                    xaxis: {
                                        from: options.selection.range.from,
                                        to: options.selection.range.to
                                    }
                                }, true);
                            }
                        };

                        createPlotAnnotation = function () {
                            plotArea.append("<div class='chart-annotation'>" + $translate.instant('chart.annotation') + "</div>");
                        };

                        createYAxis = function (plot) {
                            // remove old labels
                            $(plot.getPlaceholder()).find('.yaxisLabel').remove();

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
                                    var yaxisLabel = $("<div class='axisLabel yaxisLabel' style=left:" + box.left + "px;></div>").text(axis.options.uom).appendTo(plot.getPlaceholder());
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

                        scope.$watch('options', function () {
                            initNewPlot(plotArea, scope.dataset, scope.options);
                        }, true);

                        scope.$watch('dataset', function (bla, blub) {
                            initNewPlot(plotArea, scope.dataset, scope.options);
                        }, true);

                        // plot new when resize
                        angular.element($window).bind('resize', function () {
                            initNewPlot(plotArea, scope.dataset, scope.options);
                        });

                        // plot pan ended event
                        $(plotArea).bind('plotpanEnd', function (evt, plot) {
                            var xaxis = plot.getXAxes()[0];
                            var from = moment(xaxis.min);
                            var till = moment(xaxis.max);
                            timeService.setFlexibleTimeExtent(from, till);
                        });

                        // plot selected event
                        $(plotArea).bind('plotselected', function (evt, ranges) {
                            var from = moment(ranges.xaxis.from);
                            var to = moment(ranges.xaxis.to);
                            timeService.setFlexibleTimeExtent(from, to);
                        });
                    }
                };
            }]);
angular.module('n52.core.overviewDiagram', ['n52.core.timeseries', 'n52.core.time', 'n52.core.flot', 'n52.core.timeSelectorButtons', 'n52.core.settings', 'n52.core.yAxisHide'])
        .controller('overviewChartCtrl', ['$scope', 'flotOverviewChartServ',
            function ($scope, flotOverviewChartServ) {
                $scope.options = flotOverviewChartServ.options;
                $scope.dataset = flotOverviewChartServ.dataset;
            }])
        .factory('flotOverviewChartServ', ['timeseriesService', 'timeService', '$rootScope', 'interfaceService', 'utils', 'flotDataHelperServ',
            function (timeseriesService, timeService, $rootScope, interfaceService, utils, flotDataHelperServ) {
                var options = {
                    series: {
                        downsample: {
                            threshold: 0
                        },
                        lines: {
                            show: true,
                            fill: false
                        },
                        shadowSize: 1
                    },
                    selection: {
                        mode: "overview",
                        color: "#718296",
                        shape: "butt",
                        minSize: 30
                    },
                    grid: {
                        hoverable: true,
                        autoHighlight: false
                    },
                    xaxis: {
                        mode: "time",
                        timezone: "browser"
                    },
                    yaxis: {
                        show: false
                    },
                    legend: {
                        show: false
                    }
                };
                var dataset = [];
                var renderOptions={
                    showRefValues: false,
                    showSelection: false
                };
                setTimeExtent();
                setSelectionExtent();

                $rootScope.$on('timeseriesChanged', function (evt, id) {
                    loadOverViewData(id);
                });

                $rootScope.$on('allTimeseriesChanged', function () {
                    loadAllOverViewData();
                });

                $rootScope.$on('timeseriesDataChanged', function (evt, id) {
                    loadOverViewData(id);
                });

                $rootScope.$on('timeExtentChanged', function () {
                    setTimeExtent();
                    setSelectionExtent();
                    loadAllOverViewData();
                });

                function setTimeExtent() {
                    var time = timeService.time;
                    var durationBuffer = moment.duration(time.duration).add(time.duration);
                    var start = moment(time.start).subtract(durationBuffer);
                    var end = moment(time.end).add(durationBuffer);
                    options.xaxis.min = start.toDate().getTime();
                    options.xaxis.max = end.toDate().getTime();
                }

                function setSelectionExtent() {
                    options.selection.range = {
                        from: timeService.time.start.toDate().getTime(),
                        to: timeService.time.end.toDate().getTime()
                    };
                }
                
                function loadAllOverViewData() {
                    angular.forEach(timeseriesService.timeseries, function (ts) {
                        loadOverViewData(ts.internalId);
                    });
                }

                function loadOverViewData(tsId) {
                    var ts = timeseriesService.getTimeseries(tsId);
                    if (ts) {
                        var start = options.xaxis.min, end = options.xaxis.max;
                        interfaceService.getTsData(ts.id, ts.apiUrl, utils.createRequestTimespan(start, end)).success(function (data) {
                            flotDataHelperServ.updateTimeseriesInDataSet(dataset, renderOptions, ts.internalId, data[ts.id]);
                        });
                    } else {
                        flotDataHelperServ.updateTimeseriesInDataSet(dataset, renderOptions, tsId);
                    }
                }

                return {
                    dataset: dataset,
                    options: options
                };
            }]);

(function ($) {
    function init(plot) {
        var selection = {
            start: -1,
            end: -1,
            show: false
        };

        var savedhandlers = {};

        var mouseUpHandler = null;

        function isLeft(slider, posX) {
            return slider.left.x < posX && posX < (slider.left.x + slider.left.w * 2);
        }

        function isInner(slider, posX) {
            return slider.inner.x < posX && posX < (slider.inner.x + slider.inner.w);
        }

        function isRight(slider, posX) {
            return slider.right.x < posX && posX < (slider.right.x + slider.right.w * 2);
        }

        function getOffset(slider, posX, type) {
            return posX - slider[type].x;
        }

        function determineDragging(slider, posX) {
            if (isInner(slider, posX)) {
                selection.dragging = "inner";
                selection.offsetLeft = getOffset(slider, posX, "inner");
            }
            if (isLeft(slider, posX)) {
                selection.dragging = "left";
                selection.offsetLeft = getOffset(slider, posX, "left");
            }
            if (isRight(slider, posX)) {
                selection.dragging = "right";
                selection.offsetLeft = getOffset(slider, posX, "right");
            }
        }

        function onMouseMove(e) {
            if (selection.dragging) {
                updateSelection(e);
            }
        }

        function onMouseDown(e) {
            if (e.which !== 1)
                return;

            // cancel out any text selections
            document.body.focus();

            // prevent text selection and drag in old-school browsers
            if (document.onselectstart !== undefined && savedhandlers.onselectstart === null) {
                savedhandlers.onselectstart = document.onselectstart;
                document.onselectstart = function () {
                    return false;
                };
            }
            if (document.ondrag !== undefined && savedhandlers.ondrag === null) {
                savedhandlers.ondrag = document.ondrag;
                document.ondrag = function () {
                    return false;
                };
            }
            var mouseX = getPositionInPlot(e.pageX);

            determineDragging(selection.slider, mouseX);

            mouseUpHandler = function (e) {
                onMouseUp(e);
            };

            $(document).one("mouseup", mouseUpHandler);
        }

        function onMouseUp(e) {
            mouseUpHandler = null;

            // revert drag stuff for old-school browsers
            if (document.onselectstart !== undefined)
                document.onselectstart = savedhandlers.onselectstart;
            if (document.ondrag !== undefined)
                document.ondrag = savedhandlers.ondrag;

            selection.dragging = null;

            // no more dragging
            updateSelection(e);

            if (isSelectionValid())
                triggerSelectedEvent();
            else {
                // this counts as a clear
                plot.getPlaceholder().trigger("plotunselected", []);
                plot.getPlaceholder().trigger("plotselecting", [null]);
            }

            return false;
        }

        function getSelection() {
            if (!isSelectionValid())
                return null;

            if (!selection.show)
                return null;

            var r = {};
            $.each(plot.getXAxes(), function (name, axis) {
                if (axis.used) {
                    var p1 = axis.c2p(selection.start), p2 = axis.c2p(selection.end);
                    r.xaxis = {from: Math.min(p1, p2), to: Math.max(p1, p2)};
                }
            });
            return r;
        }

        function triggerSelectedEvent() {
            var r = getSelection();
            plot.getPlaceholder().trigger("plotselected", [r]);
        }

        function clamp(min, value, max) {
            return value < min ? min : (value > max ? max : value);
        }

        function getPositionInPlot(posX) {
            var offset = plot.getPlaceholder().offset();
            var plotOffset = plot.getPlotOffset();
            return clamp(0, posX - offset.left - plotOffset.left, plot.width());
        }

        function updateSelection(pos) {
            if (pos.pageX === null)
                return;

            if (selection.dragging === "left") {
                selection.start = getPositionInPlot(pos.pageX - selection.offsetLeft);
                if (!isSelectionValid())
                    selection.start = selection.end - plot.getOptions().selection.minSize;
            }

            if (selection.dragging === "right") {
                selection.end = getPositionInPlot(pos.pageX - selection.offsetLeft);
                if (!isSelectionValid())
                    selection.end = selection.start + plot.getOptions().selection.minSize;
            }

            if (selection.dragging === "inner") {
                var width = selection.end - selection.start;
                selection.start = getPositionInPlot(pos.pageX - selection.offsetLeft);
                selection.end = getPositionInPlot(pos.pageX - selection.offsetLeft + width);
                if (selection.start <= 0) {
                    selection.start = 0;
                    selection.end = selection.start + width;
                }
                if (selection.end >= plot.width()) {
                    selection.end = plot.width();
                    selection.start = selection.end - width;
                }
            }

            if (isSelectionValid()) {
                plot.triggerRedrawOverlay();
            }
        }

        function clearSelection(preventEvent) {
            if (selection.show) {
                selection.show = false;
                plot.triggerRedrawOverlay();
                if (!preventEvent)
                    plot.getPlaceholder().trigger("plotunselected", []);
            }
        }

        // function taken from markings support in Flot
        function extractRange(ranges, coord) {
            var axis, from, to, key, axes = plot.getAxes();

            for (var k in axes) {
                axis = axes[k];
                if (axis.direction == coord) {
                    key = coord + axis.n + "axis";
                    if (!ranges[key] && axis.n == 1)
                        key = coord + "axis"; // support x1axis as xaxis
                    if (ranges[key]) {
                        from = ranges[key].from;
                        to = ranges[key].to;
                        break;
                    }
                }
            }

            // backwards-compat stuff - to be removed in future
            if (!ranges[key]) {
                axis = coord == "x" ? plot.getXAxes()[0] : plot.getYAxes()[0];
                from = ranges[coord + "1"];
                to = ranges[coord + "2"];
            }

            // auto-reverse as an added bonus
            if (from !== null && to !== null && from > to) {
                var tmp = from;
                from = to;
                to = tmp;
            }

            return {from: from, to: to, axis: axis};
        }

        function setSelection(ranges, preventEvent) {
            var range, o = plot.getOptions();

            if (o.selection.mode == "overview") {
                range = extractRange(ranges, "x");
                selection.start = range.axis.p2c(range.from);
                selection.end = range.axis.p2c(range.to);
            }

            selection.show = true;
            plot.triggerRedrawOverlay();
            if (!preventEvent && isSelectionValid())
                triggerSelectedEvent();
        }

        function isSelectionValid() {
            var minSize = plot.getOptions().selection.minSize;
            return selection.end - selection.start >= minSize;
        }

        plot.clearSelection = clearSelection;
        plot.setSelection = setSelection;
        plot.getSelection = getSelection;

        plot.hooks.bindEvents.push(function (plot, eventHolder) {
            var o = plot.getOptions();
            if (o.selection.mode !== null) {
                eventHolder.mousemove(onMouseMove);
                eventHolder.mousedown(onMouseDown);
            }
        });

        plot.hooks.drawOverlay.push(function (plot, ctx) {
            if (selection.show) {
                var plotOffset = plot.getPlotOffset();
                var o = plot.getOptions();

                ctx.save();
                ctx.translate(plotOffset.left, plotOffset.top);

                var c = $.color.parse(o.selection.color);

                ctx.strokeStyle = c.scale('a', 0.8).toString();
                ctx.lineWidth = 6;
                ctx.lineJoin = o.selection.shape;
                ctx.fillStyle = c.scale('a', 0.4).toString();

                var x = selection.start;
                var y = Math.min(0, plot.height()) + 0.5;
                var w = selection.end - selection.start;
                var h = Math.abs(plot.height() - 0) - 1;
                var left = {x: x, y: y, w: 5, h: h},
                right = {x: x + w - 5, y: y, w: 5, h: h},
                inner = {x: x, y: y, w: w, h: h};
                selection.slider = {
                    left: left, right: right, inner: inner
                };
                ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
                ctx.strokeRect(left.x, left.y, left.w, left.h);
                ctx.strokeRect(right.x, right.y, right.w, right.h);
                ctx.restore();
            }
        });

        plot.hooks.shutdown.push(function (plot, eventHolder) {
            eventHolder.unbind("mousemove", onMouseMove);
            eventHolder.unbind("mousedown", onMouseDown);
            if (mouseUpHandler)
                $(document).unbind("mouseup", mouseUpHandler);
        });

    }

    $.plot.plugins.push({
        init: init,
        options: {
            selection: {
                mode: null, // one of null, "x", "y" or "xy"
                color: "#e8cfac",
                shape: "round", // one of "round", "miter", or "bevel"
                minSize: 5 // minimum number of pixels
            }
        },
        name: 'selection',
        version: '1.1'
    });
})(jQuery);
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