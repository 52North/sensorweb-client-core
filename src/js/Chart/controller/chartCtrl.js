angular.module('n52.core.diagram', [])
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
        .factory('flotChartServ', ['timeseriesService', 'timeService', 'settingsService', 'flotDataHelperServ', '$rootScope', 'monthNamesTranslaterServ',
            function (timeseriesService, timeService, settingsService, flotDataHelperServ, $rootScope, monthNamesTranslaterServ) {
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
                        timezone: "browser",
                        monthNames: monthNamesTranslaterServ.getMonthNames()
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

                $rootScope.$on('timeseriesChanged', function (evt, id) {
                    createYAxis();
                    flotDataHelperServ.updateTimeseriesInDataSet(dataset, renderOptions, id, timeseriesService.getData(id));
                });

                $rootScope.$on('$translateChangeEnd', function () {
                    options.xaxis.monthNames = monthNamesTranslaterServ.getMonthNames();
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
                            axesList[elem.id] = {
                                id: ++Object.keys(axesList).length,
                                uom: uom + " @ " + elem.station.properties.label,
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
                    if (angular.isUndefined(timeseriesList))
                        timeseriesList = timeseriesService.getAllTimeseries();
                    angular.forEach(timeseriesList, function (ts) {
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
                                angular.forEach(timeseriesService.getTimeseries(id).referenceValues, function (refValue) {
                                    if (refValue.visible) {
                                        var data = timeseriesService.getData(id);
                                        if (data && data.referenceValues) {
                                            dataset.push({
                                                id: id + '_refVal_' + refValue.referenceValueId,
                                                color: refValue.color,
                                                data: timeseriesService.getData(id).referenceValues[refValue.referenceValueId]
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
                    if (ts.renderingHints && ts.renderingHints.chartType && ts.renderingHints.chartType === "bar") {
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
                        if (dataset[i].id.indexOf(id) === 0)
                            dataset.splice(i, 1);
                    }
                }

                return {
                    updateAllTimeseriesToDataSet: updateAllTimeseriesToDataSet,
                    updateTimeseriesInDataSet: updateTimeseriesInDataSet,
                    removeTimeseriesFromDataSet: removeTimeseriesFromDataSet
                };
            }])
        .factory('monthNamesTranslaterServ', ['$translate',
            function ($translate) {
                getMonthNames = function () {
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
            }]);