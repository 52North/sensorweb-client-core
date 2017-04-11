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
                    var height, plotArea, width, _ref, _ref1;
                    // var plot = null;
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
                                    yaxisLabel.css('margin-left', - 4 + (yaxisLabel.height() - yaxisLabel.width()) / 2);
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

            function objectLoad() {
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
                        if (window.getComputedStyle(element).position == 'static') element.style.position = 'relative';
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
