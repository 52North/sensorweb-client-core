angular.module('n52.core.diagram')
    .service('flotChartServ', [
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
            var createYAxis = () => {
                var axesList = {};
                var requests = [];
                angular.forEach(timeseriesService.getAllTimeseries(), (elem) => {
                    var requestUom, requestLabel, requestBundle = [];
                    if (elem.uom) {
                        requestUom = labelMapperSrvc.getMappedLabel(elem.uom);
                        requestBundle.push(requestUom);
                        requests.push(requestUom);
                    }
                    if (elem.parameters && elem.parameters.phenomenon) {
                        requestLabel = labelMapperSrvc.getMappedLabel(elem.parameters.phenomenon.label);
                        requestBundle.push(requestLabel);
                        requests.push(requestLabel);
                    }
                    $q.all(requestBundle).then((result) => {
                        if (elem.styles.groupedAxis === undefined || elem.styles.groupedAxis) {
                            var label;
                            if (result.length === 2 && !result[1].indexOf('http')) {
                                label = result[1] + ' [' + result[0] + ']';
                            } else {
                                label = '[' + result[0] + ']';
                            }
                            if (!axesList.hasOwnProperty(label)) {
                                axesList[label] = {
                                    id: ++Object.keys(axesList).length,
                                    uom: label,
                                    tsColors: [elem.styles.color],
                                    zeroScaled: elem.styles.zeroScaled
                                };
                                elem.styles.yaxis = axesList[label].id;
                            } else {
                                axesList[label].tsColors.push(elem.styles.color);
                                elem.styles.yaxis = axesList[label].id;
                            }
                        } else {
                            axesList[elem.internalId] = {
                                id: ++Object.keys(axesList).length,
                                uom: label,
                                tsColors: [elem.styles.color],
                                zeroScaled: elem.styles.zeroScaled
                            };
                            elem.styles.yaxis = axesList[elem.internalId].id;
                        }
                    });
                });
                $q.all(requests).then(() => {
                    var axes = [];
                    angular.forEach(axesList, (elem) => {
                        axes.splice(elem.id - 1, 0, {
                            uom: elem.uom,
                            tsColors: elem.tsColors,
                            min: elem.zeroScaled ? 0 : this.options.yaxis.min
                        });
                    });
                    this.options.yaxes = axes;
                });
            };

            var createDataSet = () => {
                createYAxis();
                var dataset = [];
                if (timeseriesService.getTimeseriesCount() > 0) {
                    angular.forEach(timeseriesService.timeseries, (elem) => {
                        flotDataHelperServ.updateTimeseriesInDataSet(dataset, renderOptions, elem.internalId, timeseriesService.getData(elem.internalId));
                    });
                }
                return dataset;
            };

            this.options = {
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
            angular.merge(this.options, settingsService.chartOptions);
            var renderOptions = {
                showRefValues: true,
                showSelection: true,
                showActive: true
            };

            this.setTimeExtent = () => {
                this.options.xaxis.min = timeService.time.start.toDate().getTime();
                this.options.xaxis.max = timeService.time.end.toDate().getTime();
            };

            this.timeseriesDataChanged = (timeseries) => {
                createYAxis();
                flotDataHelperServ.updateAllTimeseriesToDataSet(this.dataset, renderOptions, timeseries);
            };

            this.setTimeExtent();

            $rootScope.$on('timeseriesChanged', (evt, id) => {
                createYAxis();
                flotDataHelperServ.updateTimeseriesInDataSet(this.dataset, renderOptions, id, timeseriesService.getData(id));
            });
            $rootScope.$on('$translateChangeEnd', () => {
                this.options.xaxis.monthNames = monthNamesTranslaterServ.getMonthNames();
            });
            $rootScope.$on('allTimeseriesChanged', () => {
                createYAxis();
                flotDataHelperServ.updateAllTimeseriesToDataSet(this.dataset, renderOptions, timeseriesService.getAllTimeseries());
            });

            this.dataset = createDataSet();
        }
    ]);
