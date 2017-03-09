angular.module('n52.core.diagram', []);

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

angular.module('n52.core.noDataWarning', [])
        .controller('SwcNoDataWarningCtrl', ['$scope', 'timeseriesService', function ($scope, timeseriesService) {
                $scope.timeseries = timeseriesService.timeseries;
            }])
        .filter('isNoDataVisible', function () {
            return function (timeseries) {
                if (Object.keys(timeseries).length > 0) {
                    var noDataVisible = false;
                    angular.forEach(timeseries, function (item) {
                        if (item.hasNoDataInCurrentExtent)
                            noDataVisible = true;
                    });
                    return noDataVisible;
                }
                return false;
            };
        });

        
angular.module('n52.core.overviewDiagram', [])
        .controller('SwcOverviewChartCtrl', ['$scope', 'flotOverviewChartServ', 'timeService',
            function ($scope, flotOverviewChartServ, timeService) {
                $scope.options = flotOverviewChartServ.options;
                $scope.dataset = flotOverviewChartServ.dataset;

                $scope.timeChanged = function(time) {
                    timeService.setFlexibleTimeExtent(time.from, time.till);
                };
            }])
        .factory('flotOverviewChartServ', ['timeseriesService', 'statusService', 'timeService', '$rootScope', 'seriesApiInterface', 'flotDataHelperServ', 'settingsService', 'monthNamesTranslaterServ',
            function (timeseriesService, statusService, timeService, $rootScope, seriesApiInterface, flotDataHelperServ, settingsService, monthNamesTranslaterServ) {
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
                        mode: 'overview',
                        color: '#718296',
                        shape: 'butt',
                        minSize: 30
                    },
                    grid: {
                        hoverable: false,
                        autoHighlight: false
                    },
                    xaxis: {
                        mode: 'time',
                        timezone: 'browser',
                        monthNames: monthNamesTranslaterServ.getMonthNames()
                    },
                    yaxis: {
                        show: false
                    },
                    legend: {
                        show: false
                    },
                    annotation: {
                        hide: true
                    },
                    touch: {
                        pan: '',
                        scale: ''
                    }
                };
                angular.merge(options, settingsService.overviewChartOptions);
                var dataset = [];
                var renderOptions = {
                    showRefValues: false,
                    showSelection: false,
                    showActive: false
                };
                var extendedDataRequest = {
                    generalize: true
                };
                setTimeExtent();
                setSelectionExtent();
                loadAllOverViewData();

                $rootScope.$on('$translateChangeEnd', function () {
                    options.xaxis.monthNames = monthNamesTranslaterServ.getMonthNames();
                });

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

                    var generalizeData = statusService.status.generalizeData || false;
                    options.loading = true;
                    var ts = timeseriesService.getTimeseries(tsId);
                    if (ts) {
                        var start = options.xaxis.min, end = options.xaxis.max;
                        seriesApiInterface.getTsData(ts.id, ts.apiUrl, {start: start, end: end}, extendedDataRequest, generalizeData).then(function (data) {
                            flotDataHelperServ.updateTimeseriesInDataSet(dataset, renderOptions, ts.internalId, data[ts.id]);
                            options.loading = false;
                        });
                    } else {
                        flotDataHelperServ.removeTimeseriesFromDataSet(dataset, tsId);
                        options.loading = false;
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
                selection.dragging = 'inner';
                selection.offsetLeft = getOffset(slider, posX, 'inner');
            }
            if (isLeft(slider, posX)) {
                selection.dragging = 'left';
                selection.offsetLeft = getOffset(slider, posX, 'left');
            }
            if (isRight(slider, posX)) {
                selection.dragging = 'right';
                selection.offsetLeft = getOffset(slider, posX, 'right');
            }
        }

        function onMouseMove(e) {
            if (selection.dragging) {
                if (e.originalEvent.touches && e.originalEvent.touches[0]) {
                    updateSelection(e.originalEvent.touches[0].pageX);
                } else {
                    updateSelection(e.pageX);
                }
            }
        }

        function onMouseDown(e) {
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

            var mouseX = getPositionInPlot(e.pageX || e.originalEvent.touches[0].pageX);

            determineDragging(selection.slider, mouseX);

            mouseUpHandler = function (e) {
                onMouseUp(e);
            };

            $(document).one('mouseup touchend', mouseUpHandler);
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
                plot.getPlaceholder().trigger('plotunselected', []);
                plot.getPlaceholder().trigger('plotselecting', [null]);
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
            plot.getPlaceholder().trigger('plotselected', [r]);
        }

        function clamp(min, value, max) {
            return value < min ? min : (value > max ? max : value);
        }

        function getPositionInPlot(posX) {
            var offset = plot.getPlaceholder().offset();
            var plotOffset = plot.getPlotOffset();
            return clamp(0, posX - offset.left - plotOffset.left, plot.width());
        }

        function updateSelection(pageX) {
            if (pageX === null)
                return;

            if (selection.dragging === 'left') {
                selection.start = getPositionInPlot(pageX - selection.offsetLeft);
                if (!isSelectionValid())
                    selection.start = selection.end - plot.getOptions().selection.minSize;
            }

            if (selection.dragging === 'right') {
                selection.end = getPositionInPlot(pageX - selection.offsetLeft);
                if (!isSelectionValid())
                    selection.end = selection.start + plot.getOptions().selection.minSize;
            }

            if (selection.dragging === 'inner') {
                var width = selection.end - selection.start;
                selection.start = getPositionInPlot(pageX - selection.offsetLeft);
                selection.end = getPositionInPlot(pageX - selection.offsetLeft + width);
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
                    plot.getPlaceholder().trigger('plotunselected', []);
            }
        }

        // function taken from markings support in Flot
        function extractRange(ranges, coord) {
            var axis, from, to, key, axes = plot.getAxes();

            for (var k in axes) {
                axis = axes[k];
                if (axis.direction == coord) {
                    key = coord + axis.n + 'axis';
                    if (!ranges[key] && axis.n == 1)
                        key = coord + 'axis'; // support x1axis as xaxis
                    if (ranges[key]) {
                        from = ranges[key].from;
                        to = ranges[key].to;
                        break;
                    }
                }
            }

            // backwards-compat stuff - to be removed in future
            if (!ranges[key]) {
                axis = coord == 'x' ? plot.getXAxes()[0] : plot.getYAxes()[0];
                from = ranges[coord + '1'];
                to = ranges[coord + '2'];
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

            if (o.selection.mode == 'overview') {
                range = extractRange(ranges, 'x');
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
                eventHolder.bind('mousemove touchmove', onMouseMove);
                eventHolder.bind('mousedown touchstart', onMouseDown);
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
            eventHolder.unbind('mousemove', onMouseMove);
            eventHolder.unbind('mousedown', onMouseDown);
            if (mouseUpHandler)
                $(document).unbind('mouseup', mouseUpHandler);
        });

    }

    $.plot.plugins.push({
        init: init,
        options: {
            selection: {
                mode: null, // one of null, 'x', 'y' or 'xy'
                color: '#e8cfac',
                shape: 'round', // one of 'round', 'miter', or 'bevel'
                minSize: 5 // minimum number of pixels
            }
        },
        name: 'selection',
        version: '1.1'
    });
})(jQuery);

angular.module('n52.core.diagram')
        .controller('SwcTimeseriesCtrl', ['$scope', 'timeseriesService', function ($scope, timeseriesService) {
                $scope.timeseries = timeseriesService.timeseries;
                $scope.hasTimeseries = function () {
                    return Object.keys($scope.timeseries).length > 0;
                };
                $scope.hasVisibleTimeseries = function () {
                    var allHidden = true;
                    if ($scope.hasTimeseries()) {
                        allHidden = false;
                        angular.forEach($scope.timeseries, function (series) {
                            if (series.styles.visible)
                                allHidden = true;
                        });
                    }
                    return allHidden;
                };
            }]);
angular.module('n52.core.diagram')
        .controller('SwcTooltipCtrl', ['$scope',
            function ($scope) {
                $scope.$apply();
            }]);

(function ($) {
    function init(plot) {
        if ($('#tooltip').length === 0) {
            $('<div id="tooltip"></div>').appendTo('body');
            $('#tooltip').load('templates/diagram/tooltip.html');
        }

        function plothover(event, pos, item) {
            if (item) {
                $('#tooltip').each(function () {
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
                var tooltip = $('#tooltip').show();
                if (halfwidth >= item.pageX) {
                    tooltip.css({top: item.pageY + 5, left: item.pageX + 5, right: 'auto'});
                } else {
                    tooltip.css({top: item.pageY + 5, right: ($(window).width() - item.pageX), left: 'auto'});
                }
            } else {
                $('#tooltip').hide();
            }
        }

        function shutdown(plot) {
            $(plot.getPlaceholder()).unbind('plothover', plothover);
        }

        function bindEvents(plot) {
            $(plot.getPlaceholder()).bind('plothover', plothover);
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

angular.module('n52.core.barChart', [])
    .factory('barChartHelperService', function() {
        function intervalToHour(interval) {
            switch (interval) {
                case 'byHour':
                    return 1;
                case 'byDay':
                    return 24;
                case 'byWeek':
                    return 7 * 24;
                case 'byMonth':
                    return 30 * 24;
                default:
                    return 1;
            }
        }

        function sumForInterval(data, interval) {
            var sumvalues = [];
            var range = intervalToHour(interval);
            var idx = 0;
            var entry = data[idx];
            while (entry) {
                var startInterval = entry[0];
                var endInterval = moment(entry[0]).add(range, 'hours');
                var sum = 0;
                while (entry && moment(entry[0]).isBefore(endInterval)) {
                    idx++;
                    sum = sum + entry[1];
                    entry = data[idx];
                }
                sumvalues.push([startInterval, sum]);
            }
            return sumvalues;
        }

        return {
            intervalToHour: intervalToHour,
            sumForInterval: sumForInterval
        };
    });

angular.module('n52.core.diagram')
    .factory('diagramBehaviourService', function() {
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

angular.module('n52.core.diagram').factory('flotChartServ', [
    'timeseriesService',
    'timeService',
    'settingsService',
    'flotDataHelperServ',
    '$rootScope',
    'monthNamesTranslaterServ',
    function(timeseriesService, timeService, settingsService, flotDataHelperServ, $rootScope, monthNamesTranslaterServ) {
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
                //                 show: true
                //            },
                shadowSize: 1
            },
            selection: {
                mode: null
            },
            grid: {
                hoverable: true,
                autoHighlight: true
            },
            crosshair: {
                mode: 'x'
            },
            xaxis: {
                mode: 'time',
                timezone: 'browser',
                monthNames: monthNamesTranslaterServ.getMonthNames()
                    //            timeformat: '%Y/%m/%d',
                    //use these the following two lines to have small ticks at the bottom ob the diagram
                    //            tickLength: 5,
                    //            tickColor: '#000'
            },
            yaxis: {
                show: true,
                additionalWidth: 17,
                panRange: false,
                min: null,
                labelWidth: 50
                    //			tickFormatter : function(val, axis) {
                    //				var factor = axis.tickDecimals ? Math.pow(10, axis.tickDecimals) : 1;
                    //				var formatted = '' + Math.round(val * factor) / factor;
                    //				return formatted + '<br>' + this.uom;
                    //			}
            },
            legend: {
                show: false
            },
            pan: {
                interactive: true,
                frameRate: 10
            },
            touch: {
                delayTouchEnded: 200,
                pan: 'x',
                scale: ''
            }
        };
        angular.merge(options, settingsService.chartOptions);
        var renderOptions = {
            showRefValues: true,
            showSelection: true,
            showActive: true
        };
        var dataset = createDataSet();
        setTimeExtent();
        $rootScope.$on('timeseriesChanged', function(evt, id) {
            createYAxis();
            flotDataHelperServ.updateTimeseriesInDataSet(dataset, renderOptions, id, timeseriesService.getData(id));
        });
        $rootScope.$on('$translateChangeEnd', function() {
            options.xaxis.monthNames = monthNamesTranslaterServ.getMonthNames();
        });
        $rootScope.$on('allTimeseriesChanged', function() {
            createYAxis();
            flotDataHelperServ.updateAllTimeseriesToDataSet(dataset, renderOptions, timeseriesService.getAllTimeseries());
        });
        $rootScope.$on('timeseriesDataChanged', function(evt, id) {
            createYAxis();
            flotDataHelperServ.updateTimeseriesInDataSet(dataset, renderOptions, id, timeseriesService.getData(id));
        });
        $rootScope.$on('timeExtentChanged', function() {
            setTimeExtent();
        });

        function setTimeExtent() {
            options.xaxis.min = timeService.time.start.toDate().getTime();
            options.xaxis.max = timeService.time.end.toDate().getTime();
        }

        function createYAxis() {
            var axesList = {};
            angular.forEach(timeseriesService.getAllTimeseries(), function(elem) {
                uom = elem.uom || elem.parameters.phenomenon.label;
                if (elem.styles.groupedAxis === undefined || elem.styles.groupedAxis) {
                    if (!axesList.hasOwnProperty(uom)) {
                        axesList[uom] = {
                            id: ++Object.keys(axesList).length,
                            uom: uom,
                            tsColors: [elem.styles.color],
                            zeroScaled: elem.styles.zeroScaled
                        };
                        elem.styles.yaxis = axesList[uom].id;
                    } else {
                        axesList[uom].tsColors.push(elem.styles.color);
                        elem.styles.yaxis = axesList[uom].id;
                    }
                } else {
                    axesList[elem.internalId] = {
                        id: ++Object.keys(axesList).length,
                        uom: uom + ' @ ' + elem.station.properties.label,
                        tsColors: [elem.styles.color],
                        zeroScaled: elem.styles.zeroScaled
                    };
                    elem.styles.yaxis = axesList[elem.internalId].id;
                }
            });
            var axes = [];
            angular.forEach(axesList, function(elem) {
                axes.splice(elem.id - 1, 0, {
                    uom: elem.uom,
                    tsColors: elem.tsColors,
                    min: elem.zeroScaled ? 0 : options.yaxis.min
                });
            });
            options.yaxes = axes;
        }

        function createDataSet() {
            createYAxis();
            var dataset = [];
            if (timeseriesService.getTimeseriesCount() > 0) {
                angular.forEach(timeseriesService.timeseries, function(elem) {
                    flotDataHelperServ.updateTimeseriesInDataSet(dataset, renderOptions, elem.internalId, timeseriesService.getData(elem.internalId));
                });
            }
            return dataset;
        }

        return {
            dataset: dataset,
            options: options
        };
    }
]);

angular.module('n52.core.diagram').factory('flotDataHelperServ', [
    'timeseriesService',
    'settingsService',
    'barChartHelperService',
    function(timeseriesService, settingsService, barChartHelperService) {
        function updateAllTimeseriesToDataSet(dataset, renderOptions, timeseriesList) {
            if (angular.isUndefined(timeseriesList))
                timeseriesList = timeseriesService.getAllTimeseries();
            angular.forEach(timeseriesList, function(ts) {
                updateTimeseriesInDataSet(dataset, renderOptions, ts.internalId, timeseriesService.getData(ts.internalId));
            });
        }

        function updateTimeseriesInDataSet(dataset, renderOptions, id, data) {
            removeTimeseriesFromDataSet(dataset, id);
            if (!updateTimeseriesToDataSet(dataset, renderOptions, id, data)) {
                updateAllTimeseriesToDataSet(dataset, renderOptions);
            }
        }

        function updateTimeseriesToDataSet(dataset, renderOptions, id, data) {
            if (timeseriesService.hasTimeseries(id)) {
                if (timeseriesService.isTimeseriesVisible(id)) {
                    var ts = timeseriesService.getTimeseries(id);
                    if (data && data.values) {
                        var dataEntry = createEntry(ts, data, renderOptions);
                        dataset.push(dataEntry);
                    }
                    // add possible ref values
                    if (renderOptions.showRefValues) {
                        angular.forEach(timeseriesService.getTimeseries(id).referenceValues, function(refValue) {
                            if (refValue.visible) {
                                var data = timeseriesService.getData(id);
                                if (data && data.referenceValues) {
                                    dataset.push({
                                        id: id + '_refVal_' + refValue.referenceValueId,
                                        color: refValue.color,
                                        data: timeseriesService.getData(id).referenceValues[refValue.referenceValueId],
                                        type: 'refVal'
                                    });
                                }
                            }
                        });
                    }
                }
                return true;
            }
            return false;
        }

        function createEntry(ts, data, renderOptions) {
            var lineWidth = settingsService.commonLineWidth,
                selected = ts.styles.selected && renderOptions.showSelection;
            if (ts.isActive && renderOptions.showActive)
                lineWidth = settingsService.activeLineWidth;
            if (selected)
                lineWidth = settingsService.selectedLineWidth;
            var dataEntry = {
                id: ts.internalId,
                color: ts.styles.color,
                data: data.values,
                selected: selected,
                lines: {
                    lineWidth: lineWidth
                },
                bars: {
                    lineWidth: lineWidth
                },
                yaxis: ts.styles.yaxis
            };
            // bar chart
            if (ts.renderingHints && ts.renderingHints.chartType && ts.renderingHints.chartType === 'bar') {
                var interval = ts.renderingHints.properties.interval;
                dataEntry.bars = {
                    lineWidth: lineWidth,
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
            return removeData(dataset, id);
        }

        function removeData(dataset, id) {
            for (var i = dataset.length - 1; i >= 0; i--) {
                if (dataset[i].id === id || dataset[i].id.indexOf(id) >= 0 && dataset[i].type === 'refVal')
                    dataset.splice(i, 1);
            }
        }

        return {
            updateAllTimeseriesToDataSet: updateAllTimeseriesToDataSet,
            updateTimeseriesInDataSet: updateTimeseriesInDataSet,
            removeTimeseriesFromDataSet: removeTimeseriesFromDataSet
        };
    }
]);

angular.module('n52.core.diagram')
    .factory('monthNamesTranslaterServ', ['$translate',
        function($translate) {
            getMonthNames = function() {
                return [
                    $translate.instant('chart.monthNames.jan'),
                    $translate.instant('chart.monthNames.feb'),
                    $translate.instant('chart.monthNames.mar'),
                    $translate.instant('chart.monthNames.apr'),
                    $translate.instant('chart.monthNames.may'),
                    $translate.instant('chart.monthNames.jun'),
                    $translate.instant('chart.monthNames.jul'),
                    $translate.instant('chart.monthNames.aug'),
                    $translate.instant('chart.monthNames.sep'),
                    $translate.instant('chart.monthNames.oct'),
                    $translate.instant('chart.monthNames.nov'),
                    $translate.instant('chart.monthNames.dec')
                ];
            };
            return {
                getMonthNames: getMonthNames
            };
        }
    ]);

angular.module('n52.core.flot', [])
    .directive('flot', ['$translate', 'resizeSrvc',
        function($translate, resizeSrvc) {
            return {
                restrict: 'EA',
                template: '<div></div>',
                scope: {
                    seriesSelectionChanged: '&onSeriesSelectionChange',
                    timeChanged: '&onTimeChange',
                    dataset: '=',
                    options: '=',
                    identifier: '='
                },
                link: function(scope, element, attributes) {
                    var height, plot, plotArea, width, _ref, _ref1;
                    plot = null;
                    width = attributes.width || '100%';
                    height = attributes.height || '100%';
                    if (((_ref = scope.options) !== null ? (_ref1 = _ref.legend) !== null ? _ref1.container : void 0 : void 0) instanceof jQuery) {
                        throw 'Please use a jQuery expression string with the legend.container option.';
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

                    var plotChart = function(plotArea, dataset, options) {
                        if (dataset && dataset.length !== 0) {
                            var plotObj = $.plot(plotArea, dataset, options);
                            createPlotAnnotation(plotArea, options);
                            createYAxis(plotObj);
                            setSelection(plotObj, options);
                        } else {
                            plotArea.empty();
                            $('.axisLabel').remove();
                        }
                    };

                    var setSelection = function(plot, options) {
                        if (plot && options.selection.range) {
                            plot.setSelection({
                                xaxis: {
                                    from: options.selection.range.from,
                                    to: options.selection.range.to
                                }
                            }, true);
                        }
                    };

                    var createPlotAnnotation = function(plotArea, options) {
                        if (!options.annotation || !options.annotation.hide) {
                            plotArea.append('<div class="chart-annotation">' + $translate.instant('chart.annotation') + '</div>');
                        }
                    };

                    var createYAxis = function(plot) {
                        if (plot.getOptions().yaxis.show) {
                            // remove old labels
                            $(plot.getPlaceholder()).find('.yaxisLabel').remove();

                            // createYAxis
                            $.each(plot.getAxes(), $.proxy(function(i, axis) {
                                if (!axis.show)
                                    return;
                                var box = axis.box;
                                if (axis.direction === 'y') {
                                    $('<div class="axisTargetStyle" style="position:absolute; left:' + box.left + 'px; top:' + box.top + 'px; width:' + box.width + 'px; height:' + box.height + 'px"></div>')
                                        .data('axis.n', axis.n)
                                        .appendTo(plot.getPlaceholder());
                                    $('<div class="axisTarget" style="position:absolute; left:' + box.left + 'px; top:' + box.top + 'px; width:' + box.width + 'px; height:' + box.height + 'px"></div>')
                                        .data('axis.n', axis.n)
                                        .appendTo(plot.getPlaceholder())
                                        .click($.proxy(function(event) {
                                            var selection = {};
                                            var target = $(event.currentTarget);
                                            var selected = false;
                                            $.each($('.axisTarget'), function(index, elem) {
                                                elem = $(elem);
                                                if (target.data('axis.n') === elem.data('axis.n')) {
                                                    selected = elem.hasClass('selected');
                                                    return false; // break loop
                                                }
                                            });
                                            $.each(plot.getData(), function(index, elem) {
                                                if (target.data('axis.n') === elem.yaxis.n) {
                                                    selection[elem.id] = !selected;
                                                } else {
                                                    selection[elem.id] = false;
                                                }
                                            });
                                            if (!selected) {
                                                target.addClass('selected');
                                            }
                                            scope.$apply();
                                            scope.seriesSelectionChanged({
                                                selection: selection
                                            });
                                            scope.$emit('redrawChart');
                                        }, this));
                                    var yaxisLabel = $('<div class="axisLabel yaxisLabel" style=left:' + box.left + 'px;></div>').text(axis.options.uom)
                                        .appendTo(plot.getPlaceholder())
                                        .data('axis.n', axis.n);
                                    if (axis.options.tsColors) {
                                        $.each(axis.options.tsColors, function(idx, color) {
                                            $('<span>').html('&nbsp;&#x25CF;').css('color', color).addClass('labelColorMarker').appendTo(yaxisLabel);
                                        });
                                    }
                                    yaxisLabel.css('margin-left', -8 - (yaxisLabel.height() - yaxisLabel.width()) / 2);
                                }
                            }, this));

                            // set selection to axis
                            $.each(plot.getData(), function(index, elem) {
                                if (elem.selected) {
                                    $('.flot-y' + elem.yaxis.n + '-axis').addClass('selected');
                                    $.each($('.axisTarget'), function() {
                                        if ($(this).data('axis.n') === elem.yaxis.n) {
                                            if (!$(this).hasClass('selected')) {
                                                $(this).addClass('selected');
                                                return false;
                                            }
                                        }
                                    });
                                    $.each($('.axisTargetStyle'), function() {
                                        if ($(this).data('axis.n') === elem.yaxis.n) {
                                            if (!$(this).hasClass('selected')) {
                                                $(this).addClass('selected');
                                                return false;
                                            }
                                        }
                                    });
                                    $.each($('.axisLabel.yaxisLabel'), function() {
                                        if ($(this).data('axis.n') === elem.yaxis.n) {
                                            if (!$(this).hasClass('selected')) {
                                                $(this).addClass('selected');
                                                return false;
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    };

                    scope.$watch('options', function() {
                        plotChart(plotArea, scope.dataset, scope.options);
                    }, true);

                    scope.$watch('dataset', function() {
                        plotChart(plotArea, scope.dataset, scope.options);
                    }, true);

                    resizeSrvc.addResizeListener(element[0], function() {
                        plotChart(plotArea, scope.dataset, scope.options);
                    });

                    var redrawChartListener = scope.$on('redrawChart', function() {
                        plotChart(plotArea, scope.dataset, scope.options);
                    });

                    $(plotArea).bind('plotzoom', function(evt, plot) {
                        var xaxis = plot.getXAxes()[0];
                        var from = moment(xaxis.min);
                        var till = moment(xaxis.max);
                        changeTime(from, till);
                    });

                    // plot pan ended event
                    $(plotArea).bind('plotpanEnd', function(evt, plot) {
                        var xaxis = plot.getXAxes()[0];
                        changeTime(moment(xaxis.min), moment(xaxis.max));
                    });

                    $(plotArea).bind('touchended', function(evt, plot) {
                        var xaxis = plot.xaxis;
                        var from = moment(xaxis.from);
                        var till = moment(xaxis.to);
                        changeTime(from, till);
                    });

                    // plot selected event
                    $(plotArea).bind('plotselected', function(evt, ranges) {
                        changeTime(moment(ranges.xaxis.from), moment(ranges.xaxis.to));
                    });

                    var changeTime = function(from, till) {
                        scope.timeChanged({
                            time: {
                                from: from,
                                till: till
                            }
                        });
                    };

                    scope.$on('$destroy', function() {
                        redrawChartListener();
                    });
                }
            };
        }
    ])
    .service('resizeSrvc', [
        function() {
            // borrowed from http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/ to have a cross browser solution for element resize detection
            var attachEvent = document.attachEvent;
            var isIE = navigator.userAgent.match(/Trident/);
            console.log(isIE);
            var requestFrame = (function() {
                var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
                    function(fn) {
                        return window.setTimeout(fn, 20);
                    };
                return function(fn) {
                    return raf(fn);
                };
            })();

            var cancelFrame = (function() {
                var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame ||
                    window.clearTimeout;
                return function(id) {
                    return cancel(id);
                };
            })();

            function resizeListener(e) {
                var win = e.target || e.srcElement;
                if (win.__resizeRAF__) cancelFrame(win.__resizeRAF__);
                win.__resizeRAF__ = requestFrame(function() {
                    var trigger = win.__resizeTrigger__;
                    trigger.__resizeListeners__.forEach(function(fn) {
                        fn.call(trigger, e);
                    });
                });
            }

            function objectLoad(e) {
                this.contentDocument.defaultView.__resizeTrigger__ = this.__resizeElement__;
                this.contentDocument.defaultView.addEventListener('resize', resizeListener);
            }

            this.addResizeListener = function(element, fn) {
                if (!element.__resizeListeners__) {
                    element.__resizeListeners__ = [];
                    if (attachEvent) {
                        element.__resizeTrigger__ = element;
                        element.attachEvent('onresize', resizeListener);
                    } else {
                        if (getComputedStyle(element).position == 'static') element.style.position = 'relative';
                        var obj = element.__resizeTrigger__ = document.createElement('object');
                        obj.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
                        obj.__resizeElement__ = element;
                        obj.onload = objectLoad;
                        obj.type = 'text/html';
                        if (isIE) element.appendChild(obj);
                        obj.data = 'about:blank';
                        if (!isIE) element.appendChild(obj);
                    }
                }
                element.__resizeListeners__.push(fn);
            };

            this.removeResizeListener = function(element, fn) {
                element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
                if (!element.__resizeListeners__.length) {
                    if (attachEvent) element.detachEvent('onresize', resizeListener);
                    else {
                        element.__resizeTrigger__.contentDocument.defaultView.removeEventListener('resize', resizeListener);
                        element.__resizeTrigger__ = !element.removeChild(element.__resizeTrigger__);
                    }
                }
            };
        }
    ]);

angular.module('n52.core.diagram')
    .directive('swcReloadButton', [
        function() {
            return {
                restrict: 'E',
                templateUrl: 'n52.core.diagram.reload-button',
                controller: 'SwcReloadButtonCtrl'
            };
        }
    ])
    .controller('SwcReloadButtonCtrl', ['$scope', 'statusService', 'refreshDataSrvc',
        function($scope, statusService, refreshDataSrvc) {
            if (angular.isUndefined(statusService.status.reloadChartData)) {
                statusService.status.reloadChartData = false;
            }
            $scope.reload = statusService.status.reloadChartData;
            refreshDataSrvc.reloadData();

            $scope.toggleReload = function() {
                $scope.reload = statusService.status.reloadChartData = !statusService.status.reloadChartData;
                refreshDataSrvc.reloadData();
            };
            $scope.$on('$destroy', function() {
                refreshDataSrvc.stopReloadingData();
            });
        }
    ])
    .directive('swcRefreshTime', [
        function() {
            return {
                restrict: 'E',
                templateUrl: 'n52.core.diagram.refresh-time',
                controller: 'SwcLastRefreshCtrl'
            };
        }
    ])
    .controller('SwcLastRefreshCtrl', ['$scope', 'refreshDataSrvc', function($scope, refreshDataSrvc) {
        $scope.lastRefresh = refreshDataSrvc.lastRefresh;
    }])
    .factory('refreshDataSrvc', ['$cacheFactory', 'settingsService', '$rootScope', '$interval', 'statusService',
        function($cacheFactory, settingsService, $rootScope, $interval, statusService) {
            var reloadPromise,
                lastRefresh = {},
                refreshInterval = settingsService.refreshDataInterval ? settingsService.refreshDataInterval : 60000;

            $rootScope.$on('timeExtentChanged', function() {
                lastRefresh.time = new Date();
            });

            function refreshData() {
                $cacheFactory.get('$http').removeAll();
                $rootScope.$emit('timeExtentChanged');
            }

            function reloadData() {
                stopReloadingData();
                if (statusService.status.reloadChartData) {
                    refreshData();
                    reloadPromise = $interval(function() {
                        refreshData();
                    }, refreshInterval);
                }
            }

            function stopReloadingData() {
                $interval.cancel(reloadPromise);
            }

            return {
                lastRefresh: lastRefresh,
                reloadData: reloadData,
                stopReloadingData: stopReloadingData
            };
        }
    ]);

angular.module('n52.core.diagram')
    .directive('swcYaxisHideButton', ['diagramBehaviourService',
        function() {
            return {
                restrict: 'E',
                templateUrl: 'n52.core.diagram.y-axis-hide-button',
                controller: 'SwcYaxisHideCtrl'
            };
        }
    ])
    .controller('SwcYaxisHideCtrl', ['$scope', 'diagramBehaviourService', function($scope, diagramBehaviourService) {
        $scope.behaviour = diagramBehaviourService.behaviour;
        $scope.toggleYAxis = function() {
            diagramBehaviourService.toggleYAxis();
        };
    }]);

/* Flot plugin for adding the ability to pan and zoom the plot.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.

The default behaviour is double click and scrollwheel up/down to zoom in, drag
to pan. The plugin defines plot.zoom({ center }), plot.zoomOut() and
plot.pan( offset ) so you easily can add custom controls. It also fires
"plotpan" and "plotzoom" events, useful for synchronizing plots.

The plugin supports these options:

	zoom: {
		interactive: false
		trigger: "dblclick" // or "click" for single click
		amount: 1.5         // 2 = 200% (zoom in), 0.5 = 50% (zoom out)
	}

	pan: {
		interactive: false
		cursor: "move"      // CSS mouse cursor value used when dragging, e.g. "pointer"
		frameRate: 20
	}

	xaxis, yaxis, x2axis, y2axis: {
		zoomRange: null  // or [ number, number ] (min range, max range) or false
		panRange: null   // or [ number, number ] (min, max) or false
	}

"interactive" enables the built-in drag/click behaviour. If you enable
interactive for pan, then you'll have a basic plot that supports moving
around; the same for zoom.

"amount" specifies the default amount to zoom in (so 1.5 = 150%) relative to
the current viewport.

"cursor" is a standard CSS mouse cursor string used for visual feedback to the
user when dragging.

"frameRate" specifies the maximum number of times per second the plot will
update itself while the user is panning around on it (set to null to disable
intermediate pans, the plot will then not update until the mouse button is
released).

"zoomRange" is the interval in which zooming can happen, e.g. with zoomRange:
[1, 100] the zoom will never scale the axis so that the difference between min
and max is smaller than 1 or larger than 100. You can set either end to null
to ignore, e.g. [1, null]. If you set zoomRange to false, zooming on that axis
will be disabled.

"panRange" confines the panning to stay within a range, e.g. with panRange:
[-10, 20] panning stops at -10 in one end and at 20 in the other. Either can
be null, e.g. [-10, null]. If you set panRange to false, panning on that axis
will be disabled.

Example API usage:

	plot = $.plot(...);

	// zoom default amount in on the pixel ( 10, 20 )
	plot.zoom({ center: { left: 10, top: 20 } });

	// zoom out again
	plot.zoomOut({ center: { left: 10, top: 20 } });

	// zoom 200% in on the pixel (10, 20)
	plot.zoom({ amount: 2, center: { left: 10, top: 20 } });

	// pan 100 pixels to the left and 20 down
	plot.pan({ left: -100, top: 20 })

Here, "center" specifies where the center of the zooming should happen. Note
that this is defined in pixel space, not the space of the data points (you can
use the p2c helpers on the axes in Flot to help you convert between these).

"amount" is the amount to zoom the viewport relative to the current range, so
1 is 100% (i.e. no change), 1.5 is 150% (zoom in), 0.7 is 70% (zoom out). You
can set the default in the options.

*/

// First two dependencies, jquery.event.drag.js and
// jquery.mousewheel.js, we put them inline here to save people the
// effort of downloading them.

/*
jquery.event.drag.js ~ v1.5 ~ Copyright (c) 2008, Three Dub Media (http://threedubmedia.com)
Licensed under the MIT License ~ http://threedubmedia.googlecode.com/files/MIT-LICENSE.txt
*/
(function(a){function e(h){var k,j=this,l=h.data||{};if(l.elem)j=h.dragTarget=l.elem,h.dragProxy=d.proxy||j,h.cursorOffsetX=l.pageX-l.left,h.cursorOffsetY=l.pageY-l.top,h.offsetX=h.pageX-h.cursorOffsetX,h.offsetY=h.pageY-h.cursorOffsetY;else if(d.dragging||l.which>0&&h.which!=l.which||a(h.target).is(l.not))return;switch(h.type){case"mousedown":return a.extend(l,a(j).offset(),{elem:j,target:h.target,pageX:h.pageX,pageY:h.pageY}),b.add(document,"mousemove mouseup",e,l),i(j,!1),d.dragging=null,!1;case!d.dragging&&"mousemove":if(g(h.pageX-l.pageX)+g(h.pageY-l.pageY)<l.distance)break;h.target=l.target,k=f(h,"dragstart",j),k!==!1&&(d.dragging=j,d.proxy=h.dragProxy=a(k||j)[0]);case"mousemove":if(d.dragging){if(k=f(h,"drag",j),c.drop&&(c.drop.allowed=k!==!1,c.drop.handler(h)),k!==!1)break;h.type="mouseup"}case"mouseup":b.remove(document,"mousemove mouseup",e),d.dragging&&(c.drop&&c.drop.handler(h),f(h,"dragend",j)),i(j,!0),d.dragging=d.proxy=l.elem=!1}return!0}function f(b,c,d){b.type=c;var e=a.event.dispatch.call(d,b);return e===!1?!1:e||b.result}function g(a){return Math.pow(a,2)}function h(){return d.dragging===!1}function i(a,b){a&&(a.unselectable=b?"off":"on",a.onselectstart=function(){return b},a.style&&(a.style.MozUserSelect=b?"":"none"))}a.fn.drag=function(a,b,c){return b&&this.bind("dragstart",a),c&&this.bind("dragend",c),a?this.bind("drag",b?b:a):this.trigger("drag")};var b=a.event,c=b.special,d=c.drag={not:":input",distance:0,which:1,dragging:!1,setup:function(c){c=a.extend({distance:d.distance,which:d.which,not:d.not},c||{}),c.distance=g(c.distance),b.add(this,"mousedown",e,c),this.attachEvent&&this.attachEvent("ondragstart",h)},teardown:function(){b.remove(this,"mousedown",e),this===d.dragging&&(d.dragging=d.proxy=!1),i(this,!0),this.detachEvent&&this.detachEvent("ondragstart",h)}};c.dragstart=c.dragend={setup:function(){},teardown:function(){}}})(jQuery);

/* jquery.mousewheel.min.js
 * Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 *
 * Requires: 1.2.2+
 */
(function(d){function e(a){var b=a||window.event,c=[].slice.call(arguments,1),f=0,e=0,g=0,a=d.event.fix(b);a.type="mousewheel";b.wheelDelta&&(f=b.wheelDelta/120);b.detail&&(f=-b.detail/3);g=f;void 0!==b.axis&&b.axis===b.HORIZONTAL_AXIS&&(g=0,e=-1*f);void 0!==b.wheelDeltaY&&(g=b.wheelDeltaY/120);void 0!==b.wheelDeltaX&&(e=-1*b.wheelDeltaX/120);c.unshift(a,f,e,g);return(d.event.dispatch||d.event.handle).apply(this,c)}var c=["DOMMouseScroll","mousewheel"];if(d.event.fixHooks)for(var h=c.length;h;)d.event.fixHooks[c[--h]]=d.event.mouseHooks;d.event.special.mousewheel={setup:function(){if(this.addEventListener)for(var a=c.length;a;)this.addEventListener(c[--a],e,!1);else this.onmousewheel=e},teardown:function(){if(this.removeEventListener)for(var a=c.length;a;)this.removeEventListener(c[--a],e,!1);else this.onmousewheel=null}};d.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})})(jQuery);




(function ($) {
    var options = {
        xaxis: {
            zoomRange: null, // or [number, number] (min range, max range)
            panRange: null // or [number, number] (min, max)
        },
        zoom: {
            interactive: false,
            trigger: "dblclick", // or "click" for single click
            amount: 1.5 // how much to zoom relative to current position, 2 = 200% (zoom in), 0.5 = 50% (zoom out)
        },
        pan: {
            interactive: false,
            cursor: "move",
            frameRate: 20
        }
    };

    function init(plot) {
        function onZoomClick(e, zoomOut) {
            var c = plot.offset();
            c.left = e.pageX - c.left;
            c.top = e.pageY - c.top;
            if (zoomOut)
                plot.zoomOut({ center: c });
            else
                plot.zoom({ center: c });
        }

        function onMouseWheel(e, delta) {
            e.preventDefault();
            onZoomClick(e, delta < 0);
            return false;
        }
        
        var prevCursor = 'default', prevPageX = 0, prevPageY = 0,
            panTimeout = null;

        function onDragStart(e) {
            if (e.which != 1)  // only accept left-click
                return false;
            var c = plot.getPlaceholder().css('cursor');
            if (c)
                prevCursor = c;
            plot.getPlaceholder().css('cursor', plot.getOptions().pan.cursor);
            prevPageX = e.pageX;
            prevPageY = e.pageY;
        }
        
        function onDrag(e) {
            var frameRate = plot.getOptions().pan.frameRate;
            if (panTimeout || !frameRate)
                return;

            panTimeout = setTimeout(function () {
                plot.pan({ left: prevPageX - e.pageX,
                           top: prevPageY - e.pageY });
                prevPageX = e.pageX;
                prevPageY = e.pageY;
                                                    
                panTimeout = null;
            }, 1 / frameRate * 1000);
        }

        function onDragEnd(e) {
            if (panTimeout) {
                clearTimeout(panTimeout);
                panTimeout = null;
            }
                    
            plot.getPlaceholder().css('cursor', prevCursor);
            plot.pan({ left: prevPageX - e.pageX,
                       top: prevPageY - e.pageY });
            plot.getPlaceholder().trigger("plotpanEnd", [ plot ]);
        }
        
        function bindEvents(plot, eventHolder) {
            var o = plot.getOptions();
            if (o.zoom.interactive) {
                eventHolder[o.zoom.trigger](onZoomClick);
                eventHolder.mousewheel(onMouseWheel);
            }

            if (o.pan.interactive) {
                eventHolder.bind("dragstart", { distance: 10 }, onDragStart);
                eventHolder.bind("drag", onDrag);
                eventHolder.bind("dragend", onDragEnd);
            }
        }

        plot.zoomOut = function (args) {
            if (!args)
                args = {};
            
            if (!args.amount)
                args.amount = plot.getOptions().zoom.amount;

            args.amount = 1 / args.amount;
            plot.zoom(args);
        };
        
        plot.zoom = function (args) {
            if (!args)
                args = {};
            
            var c = args.center,
                amount = args.amount || plot.getOptions().zoom.amount,
                w = plot.width(), h = plot.height();

            if (!c)
                c = { left: w / 2, top: h / 2 };
                
            var xf = c.left / w,
                yf = c.top / h,
                minmax = {
                    x: {
                        min: c.left - xf * w / amount,
                        max: c.left + (1 - xf) * w / amount
                    },
                    y: {
                        min: c.top - yf * h / amount,
                        max: c.top + (1 - yf) * h / amount
                    }
                };

            $.each(plot.getAxes(), function(_, axis) {
                var opts = axis.options,
                    min = minmax[axis.direction].min,
                    max = minmax[axis.direction].max,
                    zr = opts.zoomRange,
                    pr = opts.panRange;

                if (zr === false) // no zooming on this axis
                    return;
                    
                min = axis.c2p(min);
                max = axis.c2p(max);
                if (min > max) {
                    // make sure min < max
                    var tmp = min;
                    min = max;
                    max = tmp;
                }

                //Check that we are in panRange
                if (pr) {
                    if (pr[0] != null && min < pr[0]) {
                        min = pr[0];
                    }
                    if (pr[1] != null && max > pr[1]) {
                        max = pr[1];
                    }
                }

                var range = max - min;
                if (zr &&
                    ((zr[0] != null && range < zr[0] && amount >1) ||
                     (zr[1] != null && range > zr[1] && amount <1)))
                    return;
            
                opts.min = min;
                opts.max = max;
            });
            
            plot.setupGrid();
            plot.draw();
            
            if (!args.preventEvent)
                plot.getPlaceholder().trigger("plotzoom", [ plot, args ]);
        };

        plot.pan = function (args) {
            var delta = {
                x: +args.left,
                y: +args.top
            };

            if (isNaN(delta.x))
                delta.x = 0;
            if (isNaN(delta.y))
                delta.y = 0;

            $.each(plot.getAxes(), function (_, axis) {
                var opts = axis.options,
                    min, max, d = delta[axis.direction];

                min = axis.c2p(axis.p2c(axis.min) + d),
                max = axis.c2p(axis.p2c(axis.max) + d);

                var pr = opts.panRange;
                if (pr === false) // no panning on this axis
                    return;
                
                if (pr) {
                    // check whether we hit the wall
                    if (pr[0] != null && pr[0] > min) {
                        d = pr[0] - min;
                        min += d;
                        max += d;
                    }
                    
                    if (pr[1] != null && pr[1] < max) {
                        d = pr[1] - max;
                        min += d;
                        max += d;
                    }
                }
                
                opts.min = min;
                opts.max = max;
            });
            
            plot.setupGrid();
            plot.draw();
            
            if (!args.preventEvent)
                plot.getPlaceholder().trigger("plotpan", [ plot, args ]);
        };

        function shutdown(plot, eventHolder) {
            eventHolder.unbind(plot.getOptions().zoom.trigger, onZoomClick);
            eventHolder.unbind("mousewheel", onMouseWheel);
            eventHolder.unbind("dragstart", onDragStart);
            eventHolder.unbind("drag", onDrag);
            eventHolder.unbind("dragend", onDragEnd);
            if (panTimeout)
                clearTimeout(panTimeout);
        }
        
        plot.hooks.bindEvents.push(bindEvents);
        plot.hooks.shutdown.push(shutdown);
    }
    
    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'navigate',
        version: '1.3'
    });
})(jQuery);
/* jquery.flot.touch 3
Plugin for Flot version 0.8.3.
Allows to use touch for pan / zoom and simulate tap, double tap as mouse clicks so other plugins can work as usual with a touch device.

https://github.com/chaveiro/flot.touch

Copyright (c) 2015 Chaveiro - Licensed under the MIT license.

Plugin triggers this events : touchstarted, touchended, tap and dbltap

If option simulClick is true the plugin will generate a simulated Mouse click event to browser on tap or double tap. 
                
Use as follow:
    $("#graph").bind("touchstarted", function (event, pos)
    {
        var x = pos.x; 
        var y = pos.y;
        // add code to act on touched point
    });
    
    $("#graph").bind("touchended", function (event, ranges)
    {
        var xstart = ranges.xaxis.from; 
        var xend = ranges.xaxis.to;
        // add code to get json data then plot again with latest data
    });
    
    $("#graph").bind("tap", function (event, pos)
    {
        var x = pos.x; 
        var y = pos.y;
        // add code to act on tap point
    });
    
    $("#graph").bind("dbltap", function (event, pos)
    {
        var x = pos.x; 
        var y = pos.y;
        // add code to act on double tap point
    });
*/

(function($) {

    function init(plot) {
        // Detect touch support
        $.support.touch = 'ontouchend' in document;
        if (!$.support.touch) {
            return;    // Ignore browsers without touch support
        }

        var isPanning = false;
        var isZooming = false;
        var lastTouchPosition = { x: -1, y: -1 };
        var startTouchPosition = lastTouchPosition;
        var lastTouchDistance = 0;
        var relativeOffset = { x: 0, y: 0};
        var relativeScale = 1.0;
        var scaleOrigin = { x: 50, y: 50 };
        var lastRedraw= new Date().getTime();
        var eventdelayTouchEnded;
        
        var tapNum = 0;
        var tapTimer, tapTimestamp;

        function pan(delta) {
            var placeholder = plot.getPlaceholder();
            var options = plot.getOptions();

            relativeOffset.x -= delta.x;
            relativeOffset.y -= delta.y;

            if (!options.touch.css) {
                return; // no css updates
            }

            switch (options.touch.pan.toLowerCase()) {
                case 'x':
                    placeholder.css('transform', 'translateX(' + relativeOffset.x + 'px)');
                    break;
                case 'y':
                    placeholder.css('transform', 'translateY(' + relativeOffset.y + 'px)');
                    break;
                default:
                    placeholder.css('transform', 'translate(' + relativeOffset.x + 'px,' + relativeOffset.y + 'px)');
                    break;
            }
        }

        function scale(delta) {
            var placeholder = plot.getPlaceholder();
            var options = plot.getOptions();

            relativeScale *= 1 + (delta / 100);

            if (!options.touch.css) {
                return; // no css updates
            }

            switch (options.touch.scale.toLowerCase()) {
                case 'x':
                    placeholder.css('transform', 'scaleX(' + relativeScale + ')');
                    break;
                case 'y':
                    placeholder.css('transform', 'scaleY(' + relativeScale + ')');
                    break;
                default:
                    placeholder.css('transform', 'scale(' + relativeScale + ')');
                    break;
            }
        }

        function processOptions(plot) {
            var placeholder = plot.getPlaceholder();
            var options = plot.getOptions();
            
            if (options.touch.autoWidth) {
                placeholder.css('width', '100%');
            }

            if (options.touch.autoHeight) {
                var placeholderParent = placeholder.parent();
                var height = 0;

                placeholderParent.siblings().each(function() {
                    height -= $(this).outerHeight();
                });

                height -= parseInt(placeholderParent.css('padding-top'), 10);
                height -= parseInt(placeholderParent.css('padding-bottom'), 10);
                height += window.innerHeight;

                placeholder.css('height', (height <= 0) ? 100 : height + 'px');
            }
        }

        function getTimestamp() {
            return new Date().getTime();
        }
    
        function bindEvents(plot, eventHolder) {
            var placeholder = plot.getPlaceholder();
            var options = plot.getOptions();
            
            if (options.touch.css) {
                placeholder.parent('div').css({'overflow': 'hidden'});
            }
            
            if (options.touch && (options.touch.pan || options.touch.scale)) {
                placeholder.bind('touchstart', function (evt) {
                    clearTimeout(eventdelayTouchEnded); // cancel pending event
                    var touches = evt.originalEvent.touches;
                    var placeholder = plot.getPlaceholder();
                    var options = plot.getOptions();

                    // remember initial axis dimensions
                    $.each(plot.getAxes(), function (index, axis) {
//                    if (axis.direction === options.touch.scale.toLowerCase() || options.touch.scale.toLowerCase() == 'xy') {
                        axis.touch = {
                            min: axis.min,
                            max: axis.max
                        };
//                    }
                    });

                    tapTimestamp = getTimestamp();
                    if (touches.length === 1) {
                        isPanning = true;
                        lastTouchPosition = {
                            x: touches[0].pageX,
                            y: touches[0].pageY
                        };
                        lastTouchDistance = 0;
                        tapNum++;
                    } else if (touches.length === 2) {
                        isZooming = true;
                        lastTouchPosition = {
                            x: (touches[0].pageX + touches[1].pageX) / 2,
                            y: (touches[0].pageY + touches[1].pageY) / 2
                        };
                        lastTouchDistance = Math.sqrt(Math.pow(touches[1].pageX - touches[0].pageX, 2) + Math.pow(touches[1].pageY - touches[0].pageY, 2));
                    }

                    var offset = placeholder.offset();
                    var rect = {
                        x: offset.left,
                        y: offset.top,
                        width: placeholder.width(),
                        height: placeholder.height()
                    };
                    startTouchPosition = {
                        x: lastTouchPosition.x,
                        y: lastTouchPosition.y
                    };

                    if (startTouchPosition.x < rect.x) {
                        startTouchPosition.x = rect.x;
                    } else if (startTouchPosition.x > rect.x + rect.width) {
                        startTouchPosition.x = rect.x + rect.width;
                    }

                    if (startTouchPosition.y < rect.y) {
                        startTouchPosition.y = rect.y;
                    } else if (startTouchPosition.y > rect.y + rect.height) {
                        startTouchPosition.y = rect.y + rect.height;
                    }

                    scaleOrigin = {
                        x: Math.round((startTouchPosition.x / rect.width) * 100),
                        y: Math.round((startTouchPosition.y / rect.height) * 100)
                    };

                    if (options.touch.css) {
                        placeholder.css('transform-origin', scaleOrigin.x + '% ' + scaleOrigin.y + '%');
                    }

                    placeholder.trigger("touchstarted", [startTouchPosition]);
                    // return false to prevent touch scrolling.
                    return false;
                });

                placeholder.bind('touchmove', function (evt) {
                    var options = plot.getOptions();
                    var touches = evt.originalEvent.touches;
                    var position, distance, delta;

                    if (isPanning && touches.length === 1) {
                        position = {
                            x: touches[0].pageX,
                            y: touches[0].pageY
                        };
                        delta = {
                            x: lastTouchPosition.x - position.x,
                            y: lastTouchPosition.y - position.y
                        };

                        // transform via the delta
                        pan(delta);

                        lastTouchPosition = position;
                        lastTouchDistance = 0;
                    } else if (isZooming && touches.length === 2) {
                        distance = Math.sqrt(Math.pow(touches[1].pageX - touches[0].pageX, 2) + Math.pow(touches[1].pageY - touches[0].pageY, 2));
                        position = {
                            x: (touches[0].pageX + touches[1].pageX) / 2,
                            y: (touches[0].pageY + touches[1].pageY) / 2
                        };
                        delta = distance - lastTouchDistance;

                        // scale via the delta
                        scale(delta);

                        lastTouchPosition = position;
                        lastTouchDistance = distance;
                    }

                    if (!options.touch.css) {  // no css updates
                        var now = new Date().getTime(),
                                framedelay = now - lastRedraw; // ms for each update
                        if (framedelay > 50) {
                            lastRedraw = now;
                            window.requestAnimationFrame(redraw);
                        }
                    }
                });

                placeholder.bind('touchend', function (evt) {
                    var placeholder = plot.getPlaceholder();
                    var options = plot.getOptions();
                    var touches = evt.originalEvent.changedTouches;

                    // reset the tap counter
                    tapTimer = setTimeout(function () {
                        tapNum = 0;
                    }, options.touch.dbltapThreshold);
                    // check if tap or dbltap
                    if (isPanning && touches.length === 1 && (tapTimestamp + options.touch.tapThreshold) - getTimestamp() >= 0 &&
                            startTouchPosition.x >= lastTouchPosition.x - options.touch.tapPrecision &&
                            startTouchPosition.x <= lastTouchPosition.x + options.touch.tapPrecision &&
                            startTouchPosition.y >= lastTouchPosition.y - options.touch.tapPrecision &&
                            startTouchPosition.y <= lastTouchPosition.y + options.touch.tapPrecision)
                    {
                        //Fire plugin Tap event
                        if (tapNum === 2) {
                            placeholder.trigger("dbltap", [lastTouchPosition]);
                        } else {
                            placeholder.trigger("tap", [lastTouchPosition]);
                        }

                        if (options.touch.simulClick) {
                            // Simulate mouse click event
                            // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent
                            var simulatedEvent = new MouseEvent("click", {
                                bubbles: true,
                                cancelable: true,
                                view: window,
                                detail: tapNum, // num of clicks
                                screenX: touches[0].screenX,
                                screenY: touches[0].screenY,
                                clientX: touches[0].clientX,
                                clientY: touches[0].clientY,
                                button: 0  // left mouse button
                            });
                            touches[0].target.dispatchEvent(simulatedEvent);
                        }
                    } else
                    {
                        var r = {};
                        c1 = {x: 0, y: 0};
                        c2 = {x: plot.width(), y: plot.height()};
                        $.each(plot.getAxes(), function (name, axis) {
                            if (axis.used) {
                                var p1 = axis.c2p(c1[axis.direction]), p2 = axis.c2p(c2[axis.direction]);
                                r[name] = {from: Math.min(p1, p2), to: Math.max(p1, p2)};
                            }
                        });

                        eventdelayTouchEnded = setTimeout(function () {
                            placeholder.trigger("touchended", [r]);
                        }, options.touch.delayTouchEnded);
                    }

                    isPanning = false;
                    isZooming = false;
                    lastTouchPosition = {x: -1, y: -1};
                    startTouchPosition = lastTouchPosition;
                    lastTouchDistance = 0;
                    relativeOffset = {x: 0, y: 0};
                    relativeScale = 1.0;
                    scaleOrigin = {x: 50, y: 50};

                    if (options.touch.css) {
                        placeholder.css({
                            'transform': 'translate(' + relativeOffset.x + 'px,' + relativeOffset.y + 'px) scale(' + relativeScale + ')',
                            'transform-origin': scaleOrigin.x + '% ' + scaleOrigin.y + '%'
                        });
                    }


                });
            }
        }

        function redraw() {
            var options = plot.getOptions();
            updateAxesMinMax();

            if (typeof options.touch.callback == 'function') {
                options.touch.callback();
            }
            else {
                plot.setupGrid();
                plot.draw();
            }
        }


        function updateAxesMinMax() {
            var options = plot.getOptions();

            // Apply the pan.
            if (relativeOffset.x !== 0 || relativeOffset.y !== 0) {
                $.each(plot.getAxes(), function(index, axis) {
                    if (axis.direction === options.touch.pan.toLowerCase() || options.touch.pan.toLowerCase() == 'xy') {
                        var min = axis.c2p(axis.p2c(axis.touch.min) - relativeOffset[axis.direction]);
                        var max = axis.c2p(axis.p2c(axis.touch.max) - relativeOffset[axis.direction]);

                        axis.options.min = min;
                        axis.options.max = max;
                    }
                });
            }

            // Apply the scale.
            if (relativeScale !== 1.0) {
                var width = plot.width();
                var height = plot.height();
                var scaleOriginPixel = {
                        x: Math.round((scaleOrigin.x / 100) * width),
                        y: Math.round((scaleOrigin.y / 100) * height)
                    };
                var range = {
                        x: {
                            min: scaleOriginPixel.x - (scaleOrigin.x / 100) * width / relativeScale,
                            max: scaleOriginPixel.x + (1 - (scaleOrigin.x / 100)) * width / relativeScale
                        },
                        y: {
                            min: scaleOriginPixel.y - (scaleOrigin.y / 100) * height / relativeScale,
                            max: scaleOriginPixel.y + (1 - (scaleOrigin.y / 100)) * height / relativeScale
                        }
                    };

                $.each(plot.getAxes(), function(index, axis) {
                    if (axis.direction === options.touch.scale.toLowerCase() || options.touch.scale.toLowerCase() == 'xy') {
                        var min = axis.c2p(range[axis.direction].min);
                        var max = axis.c2p(range[axis.direction].max);

                        if (min > max) {
                            var temp = min;
                            min = max;
                            max = temp;
                        }

                        axis.options.min = min;
                        axis.options.max = max;
                    }
                });
            }
        }


        
        function processDatapoints(plot, series, datapoints) {
            if (window.devicePixelRatio) {
                var placeholder = plot.getPlaceholder();
                placeholder.children('canvas').each(function(index, canvas) {
                    var context = canvas.getContext('2d');
                    var width = $(canvas).attr('width');
                    var height = $(canvas).attr('height');

                    $(canvas).attr('width', width * window.devicePixelRatio);
                    $(canvas).attr('height', height * window.devicePixelRatio);
                    $(canvas).css('width', width + 'px');
                    $(canvas).css('height', height + 'px');

                    context.scale(window.devicePixelRatio, window.devicePixelRatio);
                });
            }
        }
        
        function shutdown(plot, eventHolder) {
            var placeholder = plot.getPlaceholder();
            placeholder.unbind('touchstart').unbind('touchmove').unbind('touchend');
        }

        plot.hooks.processOptions.push(processOptions);
        plot.hooks.bindEvents.push(bindEvents);
        //plot.hooks.processDatapoints.push(processDatapoints); // For retina, slow on android
        plot.hooks.shutdown.push(shutdown);
    }

    $.plot.plugins.push({
        init: init,
        options: {
            touch: {
                pan: 'xy',              // what axis pan work
                scale: 'xy',            // what axis zoom work
                css: false,             // use css instead of redraw the graph (ugly!)
                autoWidth: false,
                autoHeight: false,
                delayTouchEnded: 500,   // delay in ms before touchended event is fired if no more touches
                callback: null,         // other plot draw callback
                simulClick: true,       // plugin will generate Mouse click event to brwoser on tap or double tap
                tapThreshold:150,       // range of time where a tap event could be detected
                dbltapThreshold:200,    // delay needed to detect a double tap
                tapPrecision:60/2       // tap events boundaries ( 60px square by default )
            }
        },
        name: 'touch',
        version: '3.0'
    });
})(jQuery);
