angular.module('n52.core.time', ['ngResource', 'n52.core.status'])
        .factory('timeService', ['$rootScope', 'statusService', 'utils', 
            function ($rootScope, statusService, utils) {
                var time = {
                    duration: moment.duration(statusService.status.timespan.duration),
                    start: moment(statusService.status.timespan.start),
                    end: moment(statusService.status.timespan.end)
                };

                function getCurrentTimespan() {
                    return utils.createRequestTimespan(time.start, time.end);
                }

                function setFlexibleTimeExtent(start, end) {
                    time.start = start;
                    time.end = end;
                    time.duration = moment.duration(end.diff(start));
                    fireNewTimeExtent();
                }

                function setPresetInterval(interval) {
                    if (interval.from)
                        time.start = interval.from;
                    if (interval.till)
                        time.end = interval.till;
                    if (interval.duration)
                        time.duration = interval.duration;
                    if (interval.from && interval.duration && !interval.till) {
                        time.end = moment(time.start).add(time.duration);
                    }
                    if (interval.till && interval.duration && !interval.from) {
                        time.start = moment(time.end).subtract(time.duration);
                    }
                    fireNewTimeExtent();
                }

                function stepBack() {
                    time.start = time.start.subtract(time.duration);
                    time.end = time.end.subtract(time.duration);
                    fireNewTimeExtent();
                }

                function stepForward() {
                    time.start = time.start.add(time.duration);
                    time.end = time.end.add(time.duration);
                    fireNewTimeExtent();
                }

                function jumpToLastTimeStamp(timestamp, daylimit) {
                    time.end = moment(timestamp);
                    if (daylimit)
                        time.end.endOf('day');
                    time.start = moment(time.end).subtract(time.duration);
                    fireNewTimeExtent();
                }

                function jumpToFirstTimeStamp(timestamp, daylimit) {
                    time.start = moment(timestamp);
                    if (daylimit)
                        time.start.startOf('day');
                    time.end = moment(time.start).add(time.duration);
                    fireNewTimeExtent();
                }

                function fireNewTimeExtent() {
                    statusService.status.timespan = time;
                    $rootScope.$emit('timeExtentChanged');
                }

                return {
                    getCurrentTimespan: getCurrentTimespan,
                    jumpToLastTimeStamp: jumpToLastTimeStamp,
                    jumpToFirstTimeStamp: jumpToFirstTimeStamp,
                    setFlexibleTimeExtent: setFlexibleTimeExtent,
                    setPresetInterval: setPresetInterval,
                    stepBack: stepBack,
                    stepForward: stepForward,
                    time: time
                };
            }]);