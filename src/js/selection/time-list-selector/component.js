require('../selection');

angular.module('n52.core.selection')
    .component('swcTimeListSelector', {
        bindings: {
            timeList: '<',
            timeSelected: "&onTimeSelected",
        },
        templateUrl: 'n52.core.selection.time-list-selector',
        controller: [
            function() {
                this.selectTime = (time) => {
                    this.timeSelected({
                        time
                    });
                };
            }
        ]
    });
