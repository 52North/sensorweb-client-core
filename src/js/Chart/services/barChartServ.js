angular.module('n52.core.barChart', [])
    .factory('barChartHelperService', function() {
        function intervalToHour(interval) {
            switch (interval) {
                case "byHour":
                    return 1;
                case "byDay":
                    return 24;
                case "byWeek":
                    return 7 * 24;
                case "byMonth":
                    return 30 * 24;
                default:
                    return 1;
            }
        }

        function sumForInterval(data, interval) {
            var sumvalues = [];
            var range = intervalToHour(interval);
            var idx = 0;
            var entry = data[idx];
            while (entry) {
                var startInterval = entry[0];
                var endInterval = moment(entry[0]).add(range, 'hours');
                var sum = 0;
                while (entry && moment(entry[0]).isBefore(endInterval)) {
                    idx++;
                    sum = sum + entry[1];
                    entry = data[idx];
                }
                sumvalues.push([startInterval, sum]);
            }
            return sumvalues;
        }

        return {
            intervalToHour: intervalToHour,
            sumForInterval: sumForInterval
        };
    });
