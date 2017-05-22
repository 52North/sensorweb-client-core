angular.module('n52.core.base')
    .service('timeService', ['$rootScope', 'statusService', 'timeseriesService',
        function($rootScope, statusService, timeseriesService) {
            var fireNewTimeExtent = (time) => {
                statusService.setTime(time);
                timeseriesService.timeChanged();
            };

            this.time = {
                duration: moment.duration(statusService.getTime().duration),
                start: moment(statusService.getTime().start),
                end: moment(statusService.getTime().end)
            };

            this.setFlexibleTimeExtent = (start, end) => {
                this.time.start = start;
                this.time.end = end;
                this.time.duration = moment.duration(end.diff(start));
                fireNewTimeExtent(this.time);
            };

            this.setPresetInterval = (interval) => {
                if (interval.from)
                    this.time.start = interval.from;
                if (interval.till)
                    this.time.end = interval.till;
                if (interval.duration)
                    this.time.duration = interval.duration;
                if (interval.from && interval.duration && !interval.till) {
                    this.time.end = moment(this.time.start).add(this.time.duration);
                }
                if (interval.till && interval.duration && !interval.from) {
                    this.time.start = moment(this.time.end).subtract(this.time.duration);
                }
                if (interval.till && interval.from && !interval.duration) {
                    this.time.duration = moment.duration(this.time.end.diff(this.time.start));
                }
                fireNewTimeExtent(this.time);
            };

            this.stepBack = () => {
                this.time.start = moment(this.time.start).subtract(this.time.duration);
                this.time.end = moment(this.time.end).subtract(this.time.duration);
                fireNewTimeExtent(this.time);
            };

            this.stepForward = () => {
                this.time.start = moment(this.time.start).add(this.time.duration);
                this.time.end = moment(this.time.end).add(this.time.duration);
                fireNewTimeExtent(this.time);
            };

            this.jumpToLastTimeStamp = (timestamp, daylimit) => {
                this.time.end = moment(timestamp);
                if (daylimit)
                    this.time.end.endOf('day');
                this.time.start = moment(this.time.end).subtract(this.time.duration);
                fireNewTimeExtent(this.time);
            };

            this.jumpToFirstTimeStamp = (timestamp, daylimit) => {
                this.time.start = moment(timestamp);
                if (daylimit)
                    this.time.start.startOf('day');
                this.time.end = moment(this.time.start).add(this.time.duration);
                fireNewTimeExtent(this.time);
            };

            this.centerTimespan = (duration) => {
                this.time.duration = moment.duration(duration);
                var halfspan = moment.duration(this.time.duration.valueOf() / 2);
                var center = (this.time.end.valueOf() - this.time.start.valueOf()) / 2;
                this.time.start = moment(this.time.start).add(moment.duration(center)).subtract(halfspan);
                this.time.end = moment(this.time.start).add(this.time.duration);
                fireNewTimeExtent(this.time);
            };

            this.isInCurrentTimespan = (timestamp) => {
                return moment(timestamp).isBetween(this.time.start, this.time.end);
            };

            this.getStartInMillies = () => {
                return this.time.start.unix() * 1000;
            };

            this.getEndInMillies = () => {
                return this.time.end.unix() * 1000;
            };
        }
    ]);
