
(function () {
    'use strict';
    angular.module('n52.core.flot')
            .component("flotComp", {
                template: "<div></div>",
                controller: "swccFlotCtrl as swccFlotCtrl",
                bindings: {
                    seriesSelectionChanged: "&onSeriesSelectionChange",
                    timeChanged: "&onTimeChange",
                    dataset: "<",
                    options: "<",
                    identifier: "<",
                    datasetLength: "<",
                    timeExtentChanged: "<",
                    selectedTimeseries: "<"
                }
            })
            .controller('swccFlotCtrl', [
                '$translate',
                'resizeSrvc',
                "$element",
                "$attrs",
                "$scope",
                function ($translate, resizeSrvc, element, attributes, scope) {

                    var that, height, plot, plotArea, width, _ref, _ref1;

                    function  createYAxis(plot) {
                        if (plot.getOptions().yaxis.show) {
                            // remove old labels
                            $(plot.getPlaceholder()).find('.yaxisLabel').remove();

                            // createYAxis
                            $.each(plot.getAxes(), $.proxy(function (i, axis) {
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
                                            .click($.proxy(function (event) {
                                                var selection = {};
                                                var target = $(event.currentTarget);
                                                var selected = false;
                                                $.each($('.axisTarget'), function (index, elem) {
                                                    elem = $(elem);
                                                    if (target.data('axis.n') === elem.data('axis.n')) {
                                                        selected = elem.hasClass('selected');
                                                        return false; // break loop
                                                    }
                                                });
                                                $.each(plot.getData(), function (index, elem) {
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
                                                that.seriesSelectionChanged({
                                                    selection: selection
                                                });
                                                scope.$emit('redrawChart');
                                            }, this));
                                    var yaxisLabel = $('<div class="axisLabel yaxisLabel" style=left:' + box.left + 'px;></div>').text(axis.options.uom)
                                            .appendTo(plot.getPlaceholder())
                                            .data('axis.n', axis.n);
                                    if (axis.options.tsColors) {
                                        $.each(axis.options.tsColors, function (idx, color) {
                                            $('<span>').html('&nbsp;&#x25CF;').css('color', color).addClass('labelColorMarker').appendTo(yaxisLabel);
                                        });
                                    }
                                    yaxisLabel.css('margin-left', -4 + (yaxisLabel.height() - yaxisLabel.width()) / 2);
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
                        }
                    }

                    function plotChart(plotArea, dataset, options) {


                        if (dataset && dataset.length !== 0) {
                            var plotObj = $.plot(plotArea, dataset, options);
                            createPlotAnnotation(plotArea, options);
                            createYAxis(plotObj);
                            setSelection(plotObj, options);
                        } else {
                            plotArea.empty();
                            $('.axisLabel').remove();
                        }
                    }


                    function setSelection(plot, options) {
                        if (plot && options.selection.range) {
                            plot.setSelection({
                                xaxis: {
                                    from: options.selection.range.from,
                                    to: options.selection.range.to
                                }
                            }, true);
                        }
                    }


                    function createPlotAnnotation(plotArea, options) {
                        if (!options.annotation || !options.annotation.hide) {
                            plotArea.append('<div class="chart-annotation">' + $translate.instant('chart.annotation') + '</div>');
                        }
                    }



                    function init() {

                        plot = null;
                        width = attributes.width || '100%';
                        height = attributes.height || '100%';

                        if (((_ref = that.options) !== null ? (_ref1 = _ref.legend) !== null ? _ref1.container : void 0 : void 0) instanceof jQuery) {
                            throw 'Please use a jQuery expression string with the legend.container option.';
                        }

                        if (!that.options) {
                            that.options = {
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

                        resizeSrvc.addResizeListener(element[0], function () {
                            plotChart(plotArea, that.dataset, that.options);
                        });

                        $(plotArea).bind('plotzoom', function (evt, plot) {
                            var xaxis = plot.getXAxes()[0];
                            var from = moment(xaxis.min);
                            var till = moment(xaxis.max);
                            changeTime(from, till);
                        });

                        // plot pan ended event
                        $(plotArea).bind('plotpanEnd', function (evt, plot) {
                            var xaxis = plot.getXAxes()[0];
                            changeTime(moment(xaxis.min), moment(xaxis.max));
                        });

                        $(plotArea).bind('touchended', function (evt, plot) {
                            var xaxis = plot.xaxis;
                            var from = moment(xaxis.from);
                            var till = moment(xaxis.to);
                            changeTime(from, till);
                        });

                        // plot selected event
                        $(plotArea).bind('plotselected', function (evt, ranges) {
                            changeTime(moment(ranges.xaxis.from), moment(ranges.xaxis.to));
                        });

                    }

                    function changeTime(from, till) {
                        that.timeChanged({
                            time: {
                                from: from,
                                till: till
                            }
                        });
                    }



                    this.redrawChartListener = scope.$on('redrawChart', function () {
                        plotChart(plotArea, that.dataset, that.options);
                    });

                    scope.$on('$destroy', function () {
                        that.redrawChartListener();
                    });



                    this.$onInit = function () {

                        that = this;
                        init();
                        plotChart(plotArea, that.dataset, that.options);
                    };

                    this.$onChanges = function (changeObj) {

                        if (!that) {
                            return;
                        }

                        if (changeObj.options && !angular.isUndefined(changeObj.options.currentValue)) {

                            plotChart(plotArea, that.dataset, that.options);
                        }

                        if (changeObj.datasetLength && !angular.isUndefined(changeObj.datasetLength.currentValue)) {

                            plotChart(plotArea, that.dataset, that.options);
                        }

                        if (changeObj.dataset && !angular.isUndefined(changeObj.dataset.currentValue)) {

                            plotChart(plotArea, that.dataset, that.options);
                        }

                        if (changeObj.timeExtentChanged && !angular.isUndefined(changeObj.timeExtentChanged.currentValue)) {

                            plotChart(plotArea, that.dataset, that.options);
                        }
                        
                        if (changeObj.selectedTimeseries && !angular.isUndefined(changeObj.selectedTimeseries.currentValue)) {

                            plotChart(plotArea, that.dataset, that.options);
                        }
                    };

                }
            ]);
}());