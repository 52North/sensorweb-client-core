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
