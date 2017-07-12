angular.module('n52.core.mobile')
    .directive('d3LinearChart', ['$window', 'combinedSrvc',
        function($window, combinedSrvc) {
            return {
                restrict: 'EA',
                link: function(scope, elem) {
                    scope.data = combinedSrvc.data;
                    scope.series = combinedSrvc.series;
                    scope.options = combinedSrvc.options;
                    scope.selection = combinedSrvc.selectedSection;
                    scope.values;
                    scope.showSelection = false;

                    var margin = {
                        top: 10,
                        right: 20,
                        bottom: 40,
                        left: 10
                    };
                    var background,
                        pathClass = 'path',
                        xScale, yScale,
                        focusG, highlightFocus, focuslabelValue, focuslabelTime, focuslabelY,
                        dragging, dragStart, dragCurrent, dragRect, dragRectG;

                    var maxLabelwidth = 0;

                    var d3 = $window.d3;

                    d3.select(elem[0])
                        .append('svg')
                        .attr('width', '100%')
                        .attr('height', '100%');

                    var rawSvg = elem.find('svg');
                    var svgElem = d3.select(rawSvg[0]);

                    var graph = svgElem
                        .append('g')
                        .attr('transform', 'translate(' + (margin.left + maxLabelwidth) + ',' + margin.top + ')');

                    var height = () => rawSvg.height() - margin.top - margin.bottom;

                    var width = () => rawSvg.width() - margin.left - maxLabelwidth - margin.right;

                    var calcXValue = (d, i) => {
                        var xDiagCoord = xScale(getXValue(d, i));
                        d.xDiagCoord = xDiagCoord;
                        return xDiagCoord;
                    };

                    var calcYValue = (d) => yScale(d.value);

                    var getXDomain = (values) => {
                        switch (scope.options.axisType) {
                            case 'distance':
                                return [values[0].dist, values[values.length - 1].dist];
                            case 'time':
                                return [values[0].timestamp, values[values.length - 1].timestamp];
                            default:
                                return [values[0].tick, values[values.length - 1].tick];
                        }
                    };

                    var lineFun = d3.svg.line()
                        .x(calcXValue)
                        .y(calcYValue)
                        .interpolate('linear');

                    var area = d3.svg.area()
                        .x(calcXValue)
                        .y0(height())
                        .y1(calcYValue)
                        .interpolate('linear');

                    var drawValueLine = (values) => {
                        // draw the value line
                        graph.append('svg:path')
                            .attr({
                                d: lineFun(values),
                                'stroke': 'blue',
                                'stroke-width': 1,
                                'fill': 'none',
                                'class': pathClass
                            });
                        // draw filled area
                        graph.append('svg:path')
                            .datum(values)
                            .attr({
                                d: area,
                                'class': 'graphArea'
                            });
                    };

                    var drawDots = (values) => {
                        // draw dots
                        graph.selectAll('dot')
                            .data(values)
                            .enter().append('circle')
                            .attr('stroke', 'blue')
                            .attr('r', 1.5)
                            .attr('cx', calcXValue)
                            .attr('cy', calcYValue);
                    };

                    var redrawChart = (data) => {
                        if (data) scope.values = data;
                        drawLineChart();
                        resetDrag();
                    };

                    scope.$watchCollection('data', () => {
                        if (scope.data.values.length > 0) {
                            redrawChart(scope.data.values);
                        }
                    });

                    scope.$watchCollection('selection', () => {
                        if (scope.selection.values.length > 0) {
                            scope.showSelection = true;
                            redrawChart(scope.selection.values);
                        } else {
                            scope.showSelection = false;
                            redrawChart(scope.data.values);
                        }
                    });

                    scope.$watch('options.axisType', () => redrawChart());

                    scope.$watch('options.drawLine', () => redrawChart());

                    scope.$watch('options.highlightIdx', function() {
                        if (scope.options.highlightIdx) {
                            showDiagramIndicator();
                        }
                    });

                    angular.element($window).bind('resize', () => drawLineChart());

                    var getXValue = (data) => {
                        switch (scope.options.axisType) {
                            case 'distance':
                                return data.dist;
                            case 'time':
                                return data.timestamp;
                            case 'ticks':
                                return data.tick;
                        }
                    };

                    var make_x_axis = () => {
                        return d3.svg.axis()
                            .scale(xScale)
                            .orient('bottom')
                            .ticks(10);
                    };

                    var make_y_axis = () => {
                        return d3.svg.axis()
                            .scale(yScale)
                            .orient('left')
                            .ticks(5);
                    };

                    var getXAxisLabel = () => {
                        switch (scope.options.axisType) {
                            case 'distance':
                                return 'Distance';
                            case 'time':
                                return 'Time';
                            default:
                                return 'Ticks';
                        }
                    };

                    var drawXAxis = () => {
                        xScale = d3.scale.linear()
                            .domain(getXDomain(scope.values))
                            .range([0, width()]);

                        var xAxisGen = d3.svg.axis()
                            .scale(xScale)
                            .orient('bottom')
                            .ticks(5);

                        if (scope.options.axisType === 'time') {
                            xAxisGen.tickFormat(function(d) {
                                return d3.time.format('%d.%m.%Y %H:%M:%S')(new Date(d));
                            });
                        }
                        // draw x axis
                        graph.append('svg:g')
                            .attr('class', 'x axis')
                            .attr('transform', 'translate(0,' + height() + ')')
                            .call(xAxisGen);

                        // draw the x grid lines
                        graph.append('svg:g')
                            .attr('class', 'grid')
                            .attr('transform', 'translate(0,' + height() + ')')
                            .call(make_x_axis().tickSize(-height(), 0, 0).tickFormat(''));

                        // draw upper axis as border
                        graph.append('svg:g')
                            .attr('class', 'x axis')
                            .call(d3.svg.axis()
                                .scale(xScale)
                                .orient('top')
                                .tickSize(0)
                                .tickFormat(''));

                        graph.append('text') // text label for the x axis
                            .attr('x', width() / 2)
                            .attr('y', height() + margin.bottom - 5)
                            .style('text-anchor', 'middle')
                            .text(getXAxisLabel());

                    };

                    var drawYAxis = () => {
                        var range = d3.extent(scope.values, (d) => d.value);
                        var rangeOffset = (range[1] - range[0]) * 0.10;
                        yScale = d3.scale.linear()
                            .domain([range[0] - rangeOffset, range[1] + rangeOffset])
                            .range([height(), 0]);

                        var yAxisGen = d3.svg.axis()
                            .scale(yScale)
                            .orient('left')
                            .ticks(5);

                        // draw y axis
                        graph.append('svg:g')
                            .attr('class', 'y axis')
                            .call(yAxisGen);

                        // calculate
                        var labels = d3.select('.y.axis').selectAll('text');
                        if (labels instanceof Array && labels.length === 1) {
                            maxLabelwidth = 0;
                            labels[0].forEach((elem) => {
                                if (elem.getBBox().width > maxLabelwidth) {
                                    maxLabelwidth = elem.getBBox().width;
                                }
                            });
                            graph.attr('transform', 'translate(' + (margin.left + maxLabelwidth) + ',' + margin.top + ')');
                        }

                        // draw y axis label
                        graph.append('text')
                            .attr('transform', 'rotate(-90)')
                            .attr('y', 0 - margin.left - maxLabelwidth)
                            .attr('x', 0 - (height() / 2))
                            .attr('dy', '1em')
                            .style('text-anchor', 'middle')
                            .text(scope.series.uom);

                        // draw the y grid lines
                        graph.append('svg:g')
                            .attr('class', 'grid')
                            .call(make_y_axis().tickSize(-width(), 0, 0).tickFormat(''));

                        // draw right axis as border
                        graph.append('svg:g')
                            .attr('class', 'y axis')
                            .attr('transform', 'translate(' + width() + ', 0)')
                            .call(d3.svg.axis()
                                .scale(yScale)
                                .orient('right')
                                .tickSize(0)
                                .tickFormat(''));
                    };

                    var drawLineChart = () => {
                        if (!scope.values || scope.values.length == 0) {
                            return;
                        }

                        graph.selectAll('*').remove();

                        drawYAxis();
                        drawXAxis();

                        if (scope.options.drawLine) {
                            drawValueLine(scope.values);
                        } else {
                            drawDots(scope.values);
                        }

                        background = graph.append('svg:rect')
                            .attr({
                                'width': width(),
                                'height': height(),
                                'fill': 'none',
                                'stroke': 'none',
                                'pointer-events': 'all'
                            })
                            .on('mousemove.focus', mousemoveHandler)
                            .on('mouseout.focus', mouseoutHandler)
                            .on('mousedown.drag', dragStartHandler)
                            .on('mousemove.drag', dragHandler)
                            .on('mouseup.drag', dragEndHandler);

                        focusG = graph.append('g');
                        highlightFocus = focusG.append('svg:line')
                            .attr('class', 'mouse-focus-line')
                            .attr('x2', '0')
                            .attr('y2', '0')
                            .attr('x1', '0')
                            .attr('y1', '0');
                        focuslabelValue = focusG.append('svg:text')
                            .style('pointer-events', 'none')
                            .attr('class', 'mouse-focus-label-x');
                        focuslabelTime = focusG.append('svg:text')
                            .style('pointer-events', 'none')
                            .attr('class', 'mouse-focus-label-x');
                        focuslabelY = focusG.append('svg:text')
                            .style('pointer-events', 'none')
                            .attr('class', 'mouse-focus-label-y');
                    };

                    var mousemoveHandler = () => {
                        if (!scope.values || scope.values.length === 0) {
                            return;
                        }
                        var coords = d3.mouse(background.node());
                        combinedSrvc.highlightByIdx(getItemForX(coords[0], scope.values) + getSelectionOffset());
                        scope.$apply();
                    };

                    var getSelectionOffset = () => {
                        return scope.selection.offset ? scope.selection.offset : 0;
                    };

                    var mouseoutHandler = () => {
                        hideDiagramIndicator();
                    };

                    var dragStartHandler = () => {
                        d3.event.preventDefault();
                        d3.event.stopPropagation();
                        dragging = false;
                        dragStart = d3.mouse(background.node());
                    };

                    var dragHandler = () => {
                        d3.event.preventDefault();
                        d3.event.stopPropagation();
                        dragging = true;
                        drawDragRectangle();
                    };

                    var dragEndHandler = () => {
                        if (!dragStart || !dragging) {
                            dragStart = null;
                            dragging = false;
                            combinedSrvc.resetSelection();
                            resetDrag();
                        } else {
                            var offset = getSelectionOffset(),
                                start = getItemForX(dragStart[0], scope.values) + offset,
                                end = getItemForX(dragCurrent[0], scope.values) + offset;
                            combinedSrvc.setSelection(start, end);
                            dragStart = null;
                            dragging = false;
                        }
                        scope.$apply();
                    };

                    var drawDragRectangle = () => {
                        if (!dragStart) {
                            return;
                        }

                        dragCurrent = d3.mouse(background.node());

                        var x1 = Math.min(dragStart[0], dragCurrent[0]),
                            x2 = Math.max(dragStart[0], dragCurrent[0]);

                        if (!dragRect && !dragRectG) {

                            dragRectG = graph.append('g');

                            dragRect = dragRectG.append('rect')
                                .attr('width', x2 - x1)
                                .attr('height', height())
                                .attr('x', x1)
                                .attr('class', 'mouse-drag')
                                .style('pointer-events', 'none');
                        } else {
                            dragRect.attr('width', x2 - x1)
                                .attr('x', x1);
                        }
                    };

                    var resetDrag = () => {
                        if (dragRectG) {
                            dragRectG.remove();
                            dragRectG = null;
                            dragRect = null;
                        }
                    };

                    var getItemForX = (x, data) => {
                        var index = xScale.invert(x),
                            i;
                        var bisectDate = d3.bisector(function(d) {
                            switch (scope.options.axisType) {
                                case 'distance':
                                    return d.dist;
                                case 'time':
                                    return d.timestamp;
                                case 'ticks':
                                    return d.tick;
                            }
                        }).left;
                        i = bisectDate(data, index);

                        var d0, d1;
                        if (i > 0 && i < data.length) {
                            switch (scope.options.axisType) {
                                case 'distance':
                                    d0 = data[i - 1].dist;
                                    d1 = data[i].dist;
                                    break;
                                case 'time':
                                    d0 = data[i - 1].timestamp;
                                    d1 = data[i].timestamp;
                                    break;
                                case 'ticks':
                                    d0 = data[i - 1].tick;
                                    d1 = data[i].tick;
                            }
                            return index - d0 < d1 - index ? i - 1 : i;
                        } else {
                            return i > data.length - 1 ? data.length - 1 : i;
                        }
                    };

                    var hideDiagramIndicator = () => {
                        focusG.style('visibility', 'hidden');
                    };

                    var showDiagramIndicator = () => {
                        var item = scope.data.values[scope.options.highlightIdx];
                        focusG.style('visibility', 'visible');
                        highlightFocus.attr('x1', item.xDiagCoord)
                            .attr('y1', 0)
                            .attr('x2', item.xDiagCoord)
                            .attr('y2', height())
                            .classed('hidden', false);

                        var alt = item.value,
                            numY = alt;

                        focuslabelValue
                            .attr('x', item.xDiagCoord + 2)
                            .attr('y', 13)
                            .text(numY + scope.series.uom);
                        focuslabelTime
                            .attr('x', item.xDiagCoord - 95)
                            .attr('y', 13)
                            .text(moment(item.timestamp).format('DD.MM.YY HH:mm'));
                        if (scope.options.axisType === 'distance') {
                            focuslabelY
                                .attr('y', height() - 5)
                                .attr('x', item.xDiagCoord + 2)
                                .text(item.dist + ' km');
                        }
                        if (scope.options.axisType === 'ticks') {
                            focuslabelY
                                .attr('y', height() - 5)
                                .attr('x', item.xDiagCoord + 2)
                                .text('Measurement: ' + item.tick);
                        }
                    };
                }
            };
        }
    ]);
