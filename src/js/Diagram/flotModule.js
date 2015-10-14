angular.module('n52.core.flot', ['n52.core.time', 'n52.core.barChart'])
        .directive('flot', ['timeService', '$window', '$translate', 'timeseriesService', 'styleService', '$rootScope',
            function (timeService, $window, $translate, timeseriesService, styleService, $rootScope) {
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

                        plotChart = function (plotArea, dataset, options) {
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
                                    $("<div class='axisTargetStyle' style='position:absolute; left:" + box.left + "px; top:" + box.top + "px; width:" + box.width + "px; height:" + box.height + "px'></div>")
                                            .data("axis.n", axis.n)
                                            .appendTo(plot.getPlaceholder());
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
                                    var yaxisLabel = $("<div class='axisLabel yaxisLabel' style=left:" + box.left + "px;></div>").text(axis.options.uom)
                                            .appendTo(plot.getPlaceholder())
                                            .data("axis.n", axis.n);
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
                                    $('.flot-y' + elem.yaxis.n + '-axis').addClass('selected');
                                    $.each($('.axisTarget'), function () {
                                        if ($(this).data('axis.n') === elem.yaxis.n) {
                                            if (!$(this).hasClass('selected')) {
                                                $(this).addClass('selected');
                                                return false;
                                            }
                                        }
                                    });
                                    $.each($('.axisTargetStyle'), function () {
                                        if ($(this).data('axis.n') === elem.yaxis.n) {
                                            if (!$(this).hasClass('selected')) {
                                                $(this).addClass('selected');
                                                return false;
                                            }
                                        }
                                    });
                                    $.each($('.axisLabel.yaxisLabel'), function () {
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
                            plotChart(plotArea, scope.dataset, scope.options);
                        }, true);

                        scope.$watch('dataset', function (bla, blub) {
                            plotChart(plotArea, scope.dataset, scope.options);
                        }, true);

                        // plot new when resize
                        angular.element($window).bind('resize', function () {
                            plotChart(plotArea, scope.dataset, scope.options);
                        });

                        var redrawChartListener = $rootScope.$on('redrawChart', function () {
                            plotChart(plotArea, scope.dataset, scope.options);
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

                        scope.$on('$destroy', function () {
                            redrawChartListener();
                        });
                    }
                };
            }]);