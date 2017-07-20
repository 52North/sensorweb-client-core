require('../selection');

angular.module('n52.core.selection')
    .component('swcTimeRangeSelector', {
        bindings: {
            timeList: '<',
            timespanSelected: "&onTimespanSelected",
        },
        templateUrl: 'n52.core.selection.time-range-selector',
        controller: ['$scope',
            function($scope) {

                var min, max;

                this.$onChanges = (changes) => {
                    if (this.timeList) {
                        this.start = this.selectionStart = min = this.timeList[0];
                        this.end = this.selectionEnd = max = this.timeList[this.timeList.length - 1];
                        $('#slider').slider({
                            tooltip: 'hide',
                            min: min,
                            max: max,
                            value: [min, max]
                        }).on('slideStop', (event) => {
                            this.timespanSelected({
                                timespan: {
                                    start: event.value[0],
                                    end: event.value[1]
                                }
                            });
                            $scope.$apply();
                        }).on('slide', (event) => {
                            this.selectionStart = event.value[0];
                            this.selectionEnd = event.value[1];
                            $scope.$apply();
                        });
                    }
                };
            }
        ]
    });
