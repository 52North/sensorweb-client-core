angular.module('n52.core.diagram')
    .factory('flotChartServ', [
        'timeseriesService',
        'timeService',
        'settingsService',
        'flotDataHelperServ',
        '$rootScope',
        'monthNamesTranslaterServ',
        'labelMapperSrvc',
        '$q',
        function(
            timeseriesService,
            timeService,
            settingsService,
            flotDataHelperServ,
            $rootScope,
            monthNamesTranslaterServ,
            labelMapperSrvc,
            $q
        ) {
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

            $rootScope.$on('timeExtentChanged', function() {
                setTimeExtent();
            });

            function setTimeExtent() {
                options.xaxis.min = timeService.time.start.toDate().getTime();
                options.xaxis.max = timeService.time.end.toDate().getTime();
            }

            function timeseriesDataChanged(timeseries) {
                createYAxis();
                flotDataHelperServ.updateAllTimeseriesToDataSet(dataset, renderOptions, timeseries);
            }

            function createYAxis() {
                var axesList = {};
                var requests = [];
                angular.forEach(timeseriesService.getAllTimeseries(), function(elem) {
                    var request;
                    if (elem.uom) {
                        request = labelMapperSrvc.getMappedLabel(elem.uom);
                    } else {
                        request = labelMapperSrvc.getMappedLabel(elem.parameters.phenomenon.label);
                    }
                    request.then((uom) => {
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
                                uom: uom,
                                tsColors: [elem.styles.color],
                                zeroScaled: elem.styles.zeroScaled
                            };
                            elem.styles.yaxis = axesList[elem.internalId].id;
                        }
                    });
                    requests.push(request);
                });
                $q.all(requests).then(() => {
                    var axes = [];
                    angular.forEach(axesList, function(elem) {
                        axes.splice(elem.id - 1, 0, {
                            uom: elem.uom,
                            tsColors: elem.tsColors,
                            min: elem.zeroScaled ? 0 : options.yaxis.min
                        });
                    });
                    options.yaxes = axes;
                });
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
                options: options,
                timeseriesDataChanged: timeseriesDataChanged
            };
        }
    ]);
