// extends services to provide functionality that a user cannot move the diagram outside the first or last values border
angular.module('n52.core.plugin.generalize-switch', [])
        .config(['$provide',
            function ($provide) {
                $provide.decorator('timeService', ['$delegate', 'statusService', 'Notification', '$translate', 'checkTimePeriod',
                    function ($delegate, statusService, Notification, $translate, checkTimePeriod) {

                        var oldSetFlexibleTimeExtent = $delegate.setFlexibleTimeExtent;
                        $delegate.setFlexibleTimeExtent = function (start, end) {
                            checkTimeperiod(start, end);
                            oldSetFlexibleTimeExtent(start, end);
                        };

                        var oldSetPresetInterval = $delegate.setPresetInterval;
                        $delegate.setPresetInterval = function (interval) {
                            checkTimeperiod(interval.from, interval.till);
                            oldSetPresetInterval(interval);
                        };

                        var checkTimeperiod = function (start, end) {
                            if (!statusService.status.generalizeData && checkTimePeriod.isGreater(start, end)) {
                                statusService.status.generalizeData = true;
                                Notification.error($translate.instant('originalValues.areDeactivated'));
                            }
                        };

                        return $delegate;
                    }]);
            }])
        .service('checkTimePeriod', [function () {
                var duration = moment.duration(1, 'months');
                this.isGreater = function(start, end) {
                    return moment(start).add(duration).isBefore(end);
                };
            }]);