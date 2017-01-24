angular.module('n52.core.startup')
        .service('SetTimeParameterService', ['permalinkEvaluationService', 'timeService',
            function (permalinkEvaluationService, timeService) {
                this.setsParameters = function () {
                    var timespan = permalinkEvaluationService.getParam("timespan");
                    if (timespan) {
                        var timearray = timespan.split('/');
                        var start = moment(timearray[0]);
                        var end = moment(timearray[1]);
                        timeService.setFlexibleTimeExtent(start, end);
                    }
                };
            }]);