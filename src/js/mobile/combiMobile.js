/*global d3*/
angular.module('n52.core.mobile', [])
    .directive('swcCombiMobile', [
        function() {
            return {
                restrict: 'E',
                templateUrl: 'n52.core.mobile.combi-mobile',
                replace: true,
                controller: ['$scope', 'combinedSrvc', 'leafletData',
                    function($scope, combinedSrvc, leafletData) {
                        var mouseValueLabel, mouseTimeLabel, pointG, mouseRect;
                        $scope.events = {
                            geometry: {
                                enable: ['mouseover']
                            }
                        };
                        $scope.geometry = combinedSrvc.geometry;
                        $scope.series = combinedSrvc.series;
                        $scope.providerUrl = combinedSrvc.providerUrl;
                        $scope.selectedSection = combinedSrvc.selectedSection;
                        $scope.options = combinedSrvc.options;
                        $scope.paths = {
                            section: {
                                color: 'blue',
                                weight: 4,
                                latlngs: []
                            }
                        };

                        $scope.$watch('geometry', function(geometry) {
                            if (geometry && geometry.data && geometry.data.coordinates.length > 0) {
                                if ($scope.seriesId !== $scope.series.id || $scope.providerUrl !== $scope.series.providerUrl) {
                                    centerMap();
                                    resetHighlighter();
                                    $scope.seriesId = $scope.series.id;
                                    $scope.providerUrl = $scope.series.providerUrl;
                                }
                            }
                        }, true);

                        $scope.$watch('options.highlightIdx', function() {
                            if ($scope.options.highlightIdx) {
                                drawMapMarker($scope.data.values[$scope.options.highlightIdx]);
                            } else {
                                hideMapMarker();
                            }
                        }, true);

                        $scope.$on('leafletDirectiveMap.mobileCombiMap.zoomend', function() {
                            if ($scope.options.highlightIdx !== undefined) {
                                drawMapMarker($scope.data.values[$scope.options.highlightIdx]);
                            }
                        });

                        $scope.$watchCollection('selectedSection', function(selection) {
                            if (selection && selection.values && selection.values.length > 0) {
                                $scope.paths.section.latlngs = [];
                                var ll = [];
                                angular.forEach(selection.values, function(value) {
                                    $scope.paths.section.latlngs.push({
                                        lat: value.latlng.lat,
                                        lng: value.latlng.lng
                                    });
                                    ll.push(value.latlng);
                                });
                                leafletData.getPaths('mobileCombiMap').then(function(paths) {
                                    paths.section.bringToFront();
                                });
                                leafletData.getMap('mobileCombiMap').then(function(map) {
                                    map.fitBounds(ll);
                                });
                            } else {
                                centerMap();
                                $scope.paths.section.latlngs = [];
                            }
                        }, true);

                        $scope.$on('leafletDirectiveGeoJson.mobileCombiMap.mouseover', function(event, path) {
                            if (path && path.leafletEvent && path.leafletEvent.latlng) {
                                combinedSrvc.showHighlightedItem(path.leafletEvent.latlng);
                            }
                        });

                        var centerMap = function() {
                            if ($scope.geometry && $scope.geometry.data.coordinates.length > 0) {
                                leafletData.getMap('mobileCombiMap').then(function(map) {
                                    var latlngs = [];
                                    angular.forEach($scope.geometry.data.coordinates, function(coords) {
                                        latlngs.push(L.GeoJSON.coordsToLatLng(coords));
                                    });
                                    map.fitBounds(latlngs);
                                });
                            }
                        };

                        function resetHighlighter() {
                            if (pointG) {
                                pointG.remove();
                                mouseRect.remove();
                                mouseValueLabel.remove();
                                mouseTimeLabel.remove();
                                pointG = undefined;
                            }
                        }

                        function drawMapMarker(highlighted) {
                            leafletData.getMap('mobileCombiMap').then(function(map) {
                                var layerpoint = map.latLngToLayerPoint(highlighted.latlng);

                                if (!pointG) {
                                    var g = d3.select('.leaflet-overlay-pane svg')
                                        .append('g');

                                    pointG = g.append('g');
                                    pointG.append('svg:circle')
                                        .attr('r', 6)
                                        .attr('cx', 0)
                                        .attr('cy', 0)
                                        .attr('class', 'height-focus circle-lower');

                                    mouseRect = g.append('svg:rect')
                                        .attr('class', 'map-highlight-label');
                                    mouseValueLabel = g.append('svg:text')
                                        .attr('class', 'focus-label')
                                        .style('pointer-events', 'none');
                                    mouseTimeLabel = g.append('svg:text')
                                        .attr('class', 'focus-label')
                                        .style('pointer-events', 'none');

                                }
                                pointG.attr('transform', 'translate(' + layerpoint.x + ',' + layerpoint.y + ')')
                                    .style('visibility', 'visible');
                                mouseValueLabel.attr('x', layerpoint.x + 10)
                                    .attr('y', layerpoint.y)
                                    .text(highlighted.value + $scope.series.uom)
                                    .style('visibility', 'visible');
                                mouseTimeLabel.attr('x', layerpoint.x + 10)
                                    .attr('y', layerpoint.y + 13)
                                    .text(moment(highlighted.timestamp).format('DD.MM.YY HH:mm'))
                                    .style('visibility', 'visible');
                                mouseRect.attr('x', layerpoint.x + 8)
                                    .attr('y', layerpoint.y - 11)
                                    .attr('width', 100)
                                    .attr('height', 28);
                            });
                        }

                        function hideMapMarker() {
                            if (mouseRect) {
                                mouseTimeLabel.style('visibility', 'hidden');
                                mouseValueLabel.style('visibility', 'hidden');
                                mouseRect.style('visibility', 'hidden');
                            }
                            if (pointG) {
                                pointG.style('visibility', 'hidden');
                            }
                        }
                    }
                ]
            };
        }
    ])
    .directive('d3LinearChart', ['$window', 'combinedSrvc',
        function($window, combinedSrvc) {
            return {
                restrict: 'EA',
                link: function(scope, elem) {
                    scope.data = combinedSrvc.data;
                    scope.series = combinedSrvc.series;
                    scope.options = combinedSrvc.options;

                    var margin = {
                        top: 10,
                        right: 20,
                        bottom: 40,
                        left: 40
                    };
                    var background,
                        pathClass = 'path',
                        xScale, yScale, xAxisGen, yAxisGen,
                        focusG, highlightFocus, focuslabelValue, focuslabelTime, focuslabelY,
                        dragging, dragStart, dragCurrent, dragRect, dragRectG;

                    var d3 = $window.d3;

                    d3.select(elem[0])
                        .append('svg')
                        .attr('width', '100%')
                        .attr('height', '100%');

                    var rawSvg = elem.find('svg');
                    var svgElem = d3.select(rawSvg[0]);

                    var graph = svgElem
                        .append('g')
                        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

                    var height = () => rawSvg.height() - margin.top - margin.bottom;

                    var width = () => rawSvg.width() - margin.left - margin.right;

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
                                return [0, values.length - 1];
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

                    var drawValueLine = () => {
                        // draw the value line
                        graph.append('svg:path')
                            .attr({
                                d: lineFun(scope.data.values),
                                'stroke': 'blue',
                                'stroke-width': 1,
                                'fill': 'none',
                                'class': pathClass
                            });
                        // draw filled area
                        graph.append('svg:path')
                            .datum(scope.data.values)
                            .attr({
                                d: area,
                                'class': 'graphArea'
                            });
                    };

                    var drawDots = () => {
                        // draw dots
                        graph.selectAll('dot')
                            .data(scope.data.values)
                            .enter().append('circle')
                            .attr('stroke', 'blue')
                            .attr('r', 1.5)
                            .attr('cx', calcXValue)
                            .attr('cy', calcYValue);
                    };

                    var redrawChart = () => {
                        drawLineChart();
                        resetDrag();
                    };

                    scope.$watchCollection('data', () => redrawChart());

                    scope.$watch('options.axisType', () => redrawChart());

                    scope.$watch('options.drawLine', () => redrawChart());

                    scope.$watch('options.highlightIdx', function() {
                        if (scope.options.highlightIdx) {
                            showDiagramIndicator();
                        }
                    });

                    angular.element($window).bind('resize', () => redrawChart());

                    var getXValue = (data, i) => {
                        switch (scope.options.axisType) {
                            case 'distance':
                                return data.dist;
                            case 'time':
                                return data.timestamp;
                            default:
                                return i;
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

                    var drawLineChart = () => {
                        if (!scope.data || scope.data.values.length == 0) {
                            return;
                        }

                        graph.selectAll('*').remove();

                        xScale = d3.scale.linear()
                            .domain(getXDomain(scope.data.values))
                            .range([0, width()]);

                        var range = scope.data.range.max - scope.data.range.min;
                        var rangeOffset = range * 0.05;
                        yScale = d3.scale.linear()
                            .domain([scope.data.range.min - rangeOffset, scope.data.range.max + rangeOffset])
                            .range([height(), 0]);

                        xAxisGen = d3.svg.axis()
                            .scale(xScale)
                            .orient('bottom')
                            .ticks(5);

                        if (scope.options.axisType === 'time') {
                            xAxisGen.tickFormat(function(d) {
                                return d3.time.format('%d.%m.%Y %H:%M:%S')(new Date(d));
                            });
                        }

                        yAxisGen = d3.svg.axis()
                            .scale(yScale)
                            .orient('left')
                            .ticks(5);

                        // draw the x grid lines
                        graph.append('svg:g')
                            .attr('class', 'grid')
                            .attr('transform', 'translate(0,' + height() + ')')
                            .call(make_x_axis().tickSize(-height(), 0, 0).tickFormat(''));

                        graph.append('text') // text label for the x axis
                            .attr('x', width() / 2)
                            .attr('y', height() + margin.bottom - 5)
                            .style('text-anchor', 'middle')
                            .text(getXAxisLabel());

                        // draw the y grid lines
                        graph.append('svg:g')
                            .attr('class', 'grid')
                            .call(make_y_axis().tickSize(-width(), 0, 0).tickFormat(''));

                        graph.append('text')
                            .attr('transform', 'rotate(-90)')
                            .attr('y', 0 - margin.left)
                            .attr('x', 0 - (height() / 2))
                            .attr('dy', '1em')
                            .style('text-anchor', 'middle')
                            .text(scope.series.uom);

                        // draw x axis
                        graph.append('svg:g')
                            .attr('class', 'x axis')
                            .attr('transform', 'translate(0,' + height() + ')')
                            .call(xAxisGen);

                        // draw right axis as border
                        graph.append('svg:g')
                            .attr('class', 'x axis')
                            .call(d3.svg.axis()
                                .scale(xScale)
                                .orient('top')
                                .tickSize(0)
                                .tickFormat(''));

                        // draw y axis
                        graph.append('svg:g')
                            .attr('class', 'y axis')
                            .call(yAxisGen);

                        // draw right axis as border
                        graph.append('svg:g')
                            .attr('class', 'y axis')
                            .attr('transform', 'translate(' + width() + ', 0)')
                            .call(d3.svg.axis()
                                .scale(yScale)
                                .orient('right')
                                .tickSize(0)
                                .tickFormat(''));

                        if (scope.options.drawLine) {
                            drawValueLine();
                        } else {
                            drawDots();
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
                        if (!scope.data.values || scope.data.values.length === 0) {
                            return;
                        }
                        var coords = d3.mouse(background.node());
                        combinedSrvc.highlightByIdx(getItemForX(coords[0]));
                        scope.$apply();
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
                            resetDrag();
                        } else {
                            combinedSrvc.setSelection(getItemForX(dragStart[0]), getItemForX(dragCurrent[0]));
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
                        combinedSrvc.resetSelection();
                        if (dragRectG) {
                            dragRectG.remove();
                            dragRectG = null;
                            dragRect = null;
                        }
                    };

                    var getItemForX = (x) => {
                        var index = xScale.invert(x),
                            i;
                        if (scope.options.axisType != 'ticks') {
                            var bisectDate = d3.bisector(function(d) {
                                switch (scope.options.axisType) {
                                    case 'distance':
                                        return d.dist;
                                    case 'time':
                                        return d.timestamp;
                                }
                            }).left;
                            i = bisectDate(scope.data.values, index);
                        } else {
                            i = Math.round(index);
                        }

                        var d0, d1;
                        if (i > 0 && i < scope.data.values.length) {
                            switch (scope.options.axisType) {
                                case 'distance':
                                    d0 = scope.data.values[i - 1].dist;
                                    d1 = scope.data.values[i].dist;
                                    break;
                                case 'time':
                                    d0 = scope.data.values[i - 1].timestamp;
                                    d1 = scope.data.values[i].timestamp;
                                    break;
                            }
                            return index - d0 < d1 - index ? i - 1 : i;
                        } else {
                            return i > scope.data.values.length - 1 ? scope.data.values.length - 1 : i;
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
                                .text('Measurement: ' + scope.options.highlightIdx);
                        }
                    };
                }
            };
        }
    ])
    .service('combinedSrvc', ['seriesApiInterface', 'statusService', '$route', '$q',
        function(seriesApiInterface, statusService, $route, $q) {
            this.options = {
                axisType: 'distance'
            };
            this.selectedSection = {
                values: []
            };
            this.geometry = {
                style: {
                    weight: 2,
                    opacity: 1,
                    color: 'red',
                    dashArray: '10, 5',
                    clickable: true
                },
                data: {
                    coordinates: [],
                    type: 'LineString'
                }
            };
            this.data = {
                values: [],
                range: {
                    max: 0,
                    min: Infinity
                },
                dist: 0
            };
            this.series = {};

            this.loadSeries = function(id, url) {
                return $q((resolve, reject) => {
                    this.series.providerUrl = url;
                    statusService.status.mobile = {
                        id: id,
                        url: url
                    };
                    this.series.loading = true;
                    seriesApiInterface.getDatasets(id, url, {
                            cache: false
                        })
                        .then(s => {
                            angular.extend(this.series, s);
                            var timespan = {
                                start: s.firstValue.timestamp,
                                end: s.lastValue.timestamp
                            };
                            seriesApiInterface.getDatasetData(s.id, url, timespan, {
                                    expanded: true
                                })
                                .then(data => {
                                    this.processData(data[id].values);
                                    this.series.loading = false;
                                    resolve();
                                });
                        }, () => {
                            this.series.label = 'Error while loading dataset';
                            this.series.loading = false;
                            reject();
                        });
                });
            };

            this.processData = function(data) {
                this.resetGeometry();
                this.resetData();
                for (var i = 0; i < data.length; i++) {
                    this.addToGeometry(data[i]);
                    this.addToData(data[i], data[i ? i - 1 : 0]);
                }
            };

            this.addToGeometry = function(entry) {
                this.geometry.data.coordinates.push(entry.geometry.coordinates);
            };

            this.addToData = function(entry, previous) {
                var s = new L.LatLng(entry.geometry.coordinates[1], entry.geometry.coordinates[0]);
                var e = new L.LatLng(previous.geometry.coordinates[1], previous.geometry.coordinates[0]);
                var newdist = s.distanceTo(e);
                this.data.dist = this.data.dist + Math.round(newdist / 1000 * 100000) / 100000;
                this.data.range.max = this.data.range.max < entry.value ? entry.value : this.data.range.max;
                this.data.range.min = this.data.range.min > entry.value ? entry.value : this.data.range.min;
                this.data.values.push({
                    dist: Math.round(this.data.dist * 10) / 10,
                    timestamp: entry.timestamp,
                    value: entry.value,
                    x: entry.geometry.coordinates[0],
                    y: entry.geometry.coordinates[1],
                    latlng: s
                });
            };

            this.resetGeometry = function() {
                this.geometry.data.coordinates = [];
            };

            this.resetData = function() {
                this.data.values = [];
                this.data.dist = 0;
                this.data.range.max = 0;
                this.data.range.min = Infinity;
            };

            this.findItemIdxForLatLng = function(latlng) {
                var result = null,
                    d = Infinity;
                angular.forEach(this.data.values, function(item, idx) {
                    var dist = latlng.distanceTo(item.latlng);
                    if (dist < d) {
                        d = dist;
                        result = idx;
                    }
                });
                return result;
            };

            this.highlightByIdx = function(idx) {
                this.options.highlightIdx = idx;
            };

            this.showHighlightedItem = function(latlng) {
                this.options.highlightIdx = this.findItemIdxForLatLng(latlng);
            };

            this.setSelection = function(startIdx, endIdx) {
                var start = Math.min(startIdx, endIdx),
                    end = Math.max(startIdx, endIdx);
                this.selectedSection.values = this.data.values.slice(start, end);
            };

            this.setAxis = function(axisType) {
                this.options.axisType = axisType;
            };

            this.resetSelection = function() {
                this.selectedSection.values = [];
            };

            if ($route.current.params.datasetId && $route.current.params.providerUrl) {
                this.loadSeries($route.current.params.datasetId, $route.current.params.providerUrl);
            } else if (statusService.status.mobile) {
                let lastEntry = statusService.status.mobile;
                if (lastEntry.id && lastEntry.url) {
                    this.loadSeries(lastEntry.id, lastEntry.url);
                }
            }
        }
    ])
    .component('swcMobilePermalink', {
        templateUrl: 'n52.core.mobile.permalink',
        bindings: {
            datasetId: '<',
            providerUrl: '<'
        },
        controller: ['permalinkGenerationService', '$window', '$translate',
            function(permalinkGenerationService, $window, $translate) {
                var ctrl = this;
                ctrl.createPermalink = function() {
                    var link = permalinkGenerationService.createPermalink('/mobileDiagram', {
                        datasetId: ctrl.datasetId,
                        providerUrl: ctrl.providerUrl
                    });
                    $window.prompt($translate.instant('settings.permalink.clipboardInfo'), link);
                };
            }
        ]
    })
    .component('swcMobileReload', {
        templateUrl: 'n52.core.mobile.reload',
        bindings: {
            datasetId: '<',
            providerUrl: '<'
        },
        controller: ['mobileReloadSrvc',
            function(mobileReloadSrvc) {
                this.$onChanges = function() {
                    mobileReloadSrvc.stopReload();
                };
                this.toggled = false;
                this.toggleReload = function() {
                    this.toggled = !this.toggled;
                    if (this.toggled) {
                        mobileReloadSrvc.startReload(this.datasetId, this.providerUrl);
                    } else {
                        mobileReloadSrvc.stopReload();
                    }
                };
            }
        ]
    })
    .component('swcMobileAxisToggler', {
        templateUrl: 'n52.core.mobile.axis-toggler',
        bindings: {
            axisType: '<',
            icon: '<',
            selectedAxisType: '<'
        },
        controller: ['combinedSrvc',
            function(combinedSrvc) {
                this.$onChanges = function() {
                    this.toggled = combinedSrvc.options.axisType === this.axisType;
                };

                this.toggleAxis = function() {
                    combinedSrvc.setAxis(this.axisType);
                    this.toggled = combinedSrvc.options.axisType === this.axisType;
                };
            }
        ]
    })
    .component('swcMobileChartDrawLineToggler', {
        templateUrl: 'n52.core.mobile.chart-draw-line-toggler',
        bindings: {},
        controller: ['combinedSrvc',
            function(combinedSrvc) {
                combinedSrvc.options.drawLine = true;

                this.$onChanges = function() {
                    this.toggled = combinedSrvc.options.drawLine === true;
                };

                this.toggleDrawLine = function() {
                    this.toggled = combinedSrvc.options.drawLine = !combinedSrvc.options.drawLine;
                };
            }
        ]
    })
    .service('mobileReloadSrvc', ['combinedSrvc',
        function(combinedSrvc) {
            this.reload = false;

            this.startReload = function(id, url) {
                this.reload = true;
                this.reloadData(id, url);
            };

            this.stopReload = function() {
                this.reload = false;
            };

            this.reloadData = function(id, url) {
                if (this.reload) {
                    combinedSrvc.loadSeries(id, url).then(() => {
                        setTimeout(() => {
                            this.reloadData(id, url);
                        }, 2000);
                    });
                }
            };
        }
    ])
    .service('mobilePresentDataset', ['$location', 'combinedSrvc',
        function($location, combinedSrvc) {
            this.presentDataset = function(dataset, providerUrl) {
                combinedSrvc.loadSeries(dataset.id, providerUrl);
                $location.url('/mobileDiagram');
            };
        }
    ]);
