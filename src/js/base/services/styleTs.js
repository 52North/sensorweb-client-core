angular.module('n52.core.base')
    .factory('styleService', ['$rootScope', 'settingsService', 'colorService', '$injector', "styleServiceStandalone",
        function($rootScope, settingsService, colorService, $injector, styleServiceStandalone) {

            var intervalList = settingsService.intervalList;

            function createStylesInTs(ts) {

                var styles, color, visible, selected, zeroScaled, groupedAxis;

                if (!ts.styles) {
                    ts.styles = {};
                }

                color = ts.styles.color || ts.renderingHints && ts.renderingHints.properties.color || colorService.getColor(ts.id);
                visible = true;
                selected = false;

                if (angular.isUndefined(ts.styles.zeroScaled)) {
                    zeroScaled = settingsService.defaultZeroScale;
                }

                if (angular.isUndefined(ts.styles.groupedAxis)) {
                    groupedAxis = settingsService.defaultGroupedAxis;
                }

                styles = styleServiceStandalone.createStyle(ts, color, zeroScaled, groupedAxis, selected, visible);

                angular.merge(ts.styles, styles);

                angular.forEach(ts.referenceValues, function(refValue) {
                    refValue.color = colorService.getRefColor(refValue.referenceValueId);
                });
            }

            function deleteStyle(ts) {
                colorService.removeColor(ts.styles.color);
                angular.forEach(ts.referenceValues, function(refValue) {
                    colorService.removeRefColor(refValue.color);
                });
            }

            function toggleSelection(ts) {
                ts.styles.selected = !ts.styles.selected;
                $rootScope.$emit('timeseriesChanged', ts.internalId);
            }

            function setSelection(ts, selected, quiet) {
                ts.styles.selected = selected;
                if (!quiet) {
                    $rootScope.$emit('timeseriesChanged', ts.internalId);
                }
            }

            function toggleTimeseriesVisibility(ts) {
                ts.styles.visible = !ts.styles.visible;
                $rootScope.$emit('timeseriesChanged', ts.internalId);
            }

            function updateColor(ts, color) {
                ts.styles.color = color;
                $rootScope.$emit('timeseriesChanged', ts.internalId);
            }

            function updateZeroScaled(ts) {
                ts.styles.zeroScaled = !ts.styles.zeroScaled;
                if (ts.styles.groupedAxis) {
                    var tsSrv = $injector.get('timeseriesService');
                    angular.forEach(tsSrv.getAllTimeseries(), function(timeseries) {
                        if (timeseries.uom === ts.uom && timeseries.styles.groupedAxis) {
                            timeseries.styles.zeroScaled = ts.styles.zeroScaled;
                        }
                    });
                }
                $rootScope.$emit('timeseriesChanged', ts.internalId);
            }

            function updateGroupAxis(ts) {
                ts.styles.groupedAxis = !ts.styles.groupedAxis;
                $rootScope.$emit('timeseriesChanged', ts.internalId);
            }

            function updateInterval(ts, interval) {
                ts.renderingHints.properties.interval = interval.caption;
                ts.renderingHints.properties.value = interval.value;
                $rootScope.$emit('timeseriesChanged', ts.internalId);
            }

            function notifyAllTimeseriesChanged() {
                $rootScope.$emit('allTimeseriesChanged');
            }

            function triggerStyleUpdate(ts) {
                $rootScope.$emit('timeseriesChanged', ts.internalId);
            }

            return {
                createStylesInTs: createStylesInTs,
                deleteStyle: deleteStyle,
                notifyAllTimeseriesChanged: notifyAllTimeseriesChanged,
                toggleSelection: toggleSelection,
                setSelection: setSelection,
                toggleTimeseriesVisibility: toggleTimeseriesVisibility,
                updateColor: updateColor,
                updateZeroScaled: updateZeroScaled,
                updateGroupAxis: updateGroupAxis,
                updateInterval: updateInterval,
                intervalList: intervalList,
                triggerStyleUpdate: triggerStyleUpdate
            };
        }
    ]);
