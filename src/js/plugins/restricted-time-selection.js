// extends services to provide functionality that a user cannot move the diagram outside the first or last values border
angular.module('n52.core.plugin.restricted-time-selection', [])
        .config(['$provide',
            function ($provide) {
                $provide.decorator('timeService', ['$delegate', '$rootScope', 'statusService', 'timeseriesService', 'Notification', '$translate',
                    function ($delegate, $rootScope, statusService, timeseriesService, Notification, $translate) {
                        $delegate.setFlexibleTimeExtent = function (start, end) {
                            if (hasTimeseriesDataInPeriod(start, end)) {
                                $delegate.time.start = start;
                                $delegate.time.end = end;
                                $delegate.time.duration = moment.duration(end.diff(start));
                                fireNewTimeExtent();
                            } else {
                                fireNewTimeExtent();
                            }
                        };

                        $delegate.stepBack = function () {
                            var start = moment($delegate.time.start).subtract($delegate.time.duration);
                            var end = moment($delegate.time.end).subtract($delegate.time.duration);
                            if (hasTimeseriesDataInPeriod(start, end)) {
                                $delegate.time.start = start;
                                $delegate.time.end = end;
                            }
                            fireNewTimeExtent();
                        };

                        $delegate.stepForward = function () {
                            var start = moment($delegate.time.start).add($delegate.time.duration);
                            var end = moment($delegate.time.end).add($delegate.time.duration);
                            if (hasTimeseriesDataInPeriod(start, end)) {
                                $delegate.time.start = start;
                                $delegate.time.end = end;
                            }
                            fireNewTimeExtent();
                        };

                        $delegate.setPresetInterval = function (interval) {
                            var start, end, duration;
                            if (interval.from)
                                start = interval.from;
                            if (interval.till)
                                end = interval.till;
                            if (interval.duration)
                                duration = interval.duration;
                            if (interval.from && interval.duration && !interval.till) {
                                end = moment($delegate.time.start).add($delegate.time.duration);
                            }
                            if (interval.till && interval.duration && !interval.from) {
                                start = moment($delegate.time.end).subtract($delegate.time.duration);
                            }
                            if (interval.till && interval.from && !interval.duration) {
                                duration = moment.duration($delegate.time.end.diff($delegate.time.start));
                            }
                            if (hasTimeseriesDataInPeriod(start, end)) {
                                $delegate.time.start = start;
                                $delegate.time.end = end;
                                $delegate.time.duration = duration;
                            }
                            fireNewTimeExtent();
                        };

                        var hasTimeseriesDataInPeriod = function (start, end) {
                            var hasData = false;
                            angular.forEach(timeseriesService.getAllTimeseries(), function (series) {
                                if (end > series.firstValue.timestamp && series.lastValue.timestamp > start) {
                                    hasData = true;
                                }
                            });
                            if (hasData) {
                                return true;
                            } else {
                                Notification.info($translate.instant('chart.hasNoData'));
                                return false;
                            }
                        };

                        var fireNewTimeExtent = function () {
                            statusService.setTime($delegate.time);
                            $rootScope.$emit('timeExtentChanged');
                        };
                        return $delegate;
                    }]);
            }])
        .config(['$provide',
            function ($provide) {
                $provide.decorator('flotChartServ', ['$delegate', '$rootScope',
                    function ($delegate, $rootScope) {
                        $rootScope.$on('timeExtentChanged', function () {
                            $delegate.options.xaxis.updateParam = new Date().getTime();
                        });
                        return $delegate;
                    }]);
            }])
        .config(['$provide',
            function ($provide) {
                $provide.decorator('flotOverviewChartServ', ['$delegate', '$rootScope',
                    function ($delegate, $rootScope) {
                        $rootScope.$on('timeExtentChanged', function () {
                            $delegate.options.xaxis.updateParam = new Date().getTime();
                        });
                        return $delegate;
                    }]);
            }]);