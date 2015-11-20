angular.module('n52.core.diagram', ['n52.core.time', 'n52.core.flot', 'n52.core.timeSelectorButtons', 'n52.core.settings', 'n52.core.yAxisHide'])
        .controller('SwcChartCtrl', ['$scope', 'diagramBehaviourService', 'flotChartServ',
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
                        autoHighlight: true
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
                var renderOptions = {
                    showRefValues: true,
                    showSelection: true,
                    showActive: true
                };
                var dataset = createDataSet();
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
                    createYAxis();
                    var dataset = [];
                    if (timeseriesService.getTimeseriesCount() > 0) {
                        angular.forEach(timeseriesService.timeseries, function (elem) {
                            flotDataHelperServ.updateTimeseriesInDataSet(dataset, renderOptions, elem.internalId, timeseriesService.getData(elem.internalId));
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
                    if (angular.isUndefined(timeseriesList)) timeseriesList = timeseriesService.getAllTimeseries();
                    angular.forEach(timeseriesList, function (ts) {
                        updateTimeseriesInDataSet(dataset, renderOptions, ts.internalId, timeseriesService.getData(ts.internalId));
                    });
                }

                function updateTimeseriesInDataSet(dataset, renderOptions, id, data) {
                    removeTimeseriesFromDataSet(dataset, id);
                    if (!addTimeseriesToDataSet(dataset, renderOptions, id, data)){
                        updateAllTimeseriesToDataSet(dataset, renderOptions);
                    }
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
                        return true;
                    } 
                    return false;
                }

                function createEntry(ts, data, renderOptions) {
                    var lineWidth = settingsService.commonLineWidth,
                            selected = ts.styles.selected && renderOptions.showSelection;
                    if (ts.isActive && renderOptions.showActive) lineWidth = settingsService.activeLineWidth;
                    if (selected) lineWidth = settingsService.selectedLineWidth;
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