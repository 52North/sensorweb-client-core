angular.module('styleTsModule', ['colorModule', 'timeModule', 'interfaceModule'])
        .factory('styleService', ['$rootScope', 'settingsService', 'colorService',
            function ($rootScope, settingsService, colorService) {
                var defaultIntervalList = [
                    {label: 'styleChange.barChartInterval.hour', caption: 'byHour', value: 1},
                    {label: 'styleChange.barChartInterval.day', caption: 'byDay', value: 24},
                    {label: 'styleChange.barChartInterval.week', caption: 'byWeek', value: 7 * 24},
                    {label: 'styleChange.barChartInterval.month', caption: 'byMonth', value: 30 * 24}
                ];

                var intervalList = settingsService.intervalList || defaultIntervalList;

                function createStylesInTs(ts) {
                    ts.styles = {};
                    ts.styles.color = ts.renderingHints && ts.renderingHints.properties.color || colorService.stringToColor(ts.id);
                    ts.styles.visible = true;
                    ts.styles.selected = false;
                    ts.styles.zeroScaled = false;
                    ts.styles.groupedAxis = true;
                    angular.forEach(ts.referenceValues, function (refValue) {
                        refValue.color = colorService.stringToColor(refValue.referenceValueId);
                    });
                }

                function toggleSelection(ts) {
                    ts.styles.selected = !ts.styles.selected;
                    $rootScope.$broadcast('timeseriesChanged', ts.internalId);
                }

                function setSelection(ts, selected, quiet) {
                    ts.styles.selected = selected;
                    if (!quiet) {
                        $rootScope.$broadcast('timeseriesChanged', ts.internalId);
                    }
                }

                function toggleTimeseriesVisibility(ts) {
                    ts.styles.visible = !ts.styles.visible;
                    $rootScope.$broadcast('timeseriesChanged', ts.internalId);
                }

                function updateColor(ts, color) {
                    ts.styles.color = color;
                    $rootScope.$broadcast('timeseriesChanged', ts.internalId);
                }

                function updateZeroScaled(ts) {
                    ts.styles.zeroScaled = !ts.styles.zeroScaled;
                    $rootScope.$broadcast('timeseriesChanged', ts.internalId);
                }

                function updateGroupAxis(ts) {
                    ts.styles.groupedAxis = !ts.styles.groupedAxis;
                    $rootScope.$broadcast('timeseriesChanged', ts.internalId);
                }

                function updateInterval(ts, interval) {
                    ts.renderingHints.properties.interval = interval.caption;
                    ts.renderingHints.properties.value = interval.value;
                    $rootScope.$broadcast('timeseriesChanged', ts.internalId);
                }

                function notifyAllTimeseriesChanged() {
                    $rootScope.$broadcast('allTimeseriesChanged');
                }

                return {
                    createStylesInTs: createStylesInTs,
                    notifyAllTimeseriesChanged: notifyAllTimeseriesChanged,
                    toggleSelection: toggleSelection,
                    setSelection: setSelection,
                    toggleTimeseriesVisibility: toggleTimeseriesVisibility,
                    updateColor: updateColor,
                    updateZeroScaled: updateZeroScaled,
                    updateGroupAxis: updateGroupAxis,
                    updateInterval: updateInterval,
                    intervalList: intervalList
                };
            }]);