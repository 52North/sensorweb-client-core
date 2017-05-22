// extends services to provide functionality that a user cannot select a greater time period than the settings parameter "maxTimeperiod" allows
angular.module('n52.core.plugin.restricted-time-period', [])
    .config(['$provide',
        function($provide) {
            $provide.decorator('timeService', ['$delegate', 'Notification', '$translate', 'settingsService',
                function($delegate, Notification, $translate, settingsService) {

                    var maxTimeperiod;
                    if (settingsService.maxTimeperiod) {
                        maxTimeperiod = moment.duration(settingsService.maxTimeperiod);

                        var oldSetFelxibleTimeExtent = $delegate.setFlexibleTimeExtent;
                        $delegate.setFlexibleTimeExtent = function(start, end) {
                            if (!isGreaterThenMaxTimeperiod(start, end)) {
                                oldSetFelxibleTimeExtent(start, end);
                            } else {
                                Notification.error($translate.instant('chart.reachedMaxTimeperiod'));
                                var updatedStart = moment(end).subtract(maxTimeperiod);
                                oldSetFelxibleTimeExtent(updatedStart, end);
                            }
                        };
                    }

                    var isGreaterThenMaxTimeperiod = function(start, end) {
                        return moment(start).add(maxTimeperiod).isBefore(end) ? true : false;
                    };

                    return $delegate;
                }
            ]);
        }
    ]);
