angular.module('n52.core.mobile')
    .component('swcMobileChartDrawLineToggler', {
        templateUrl: 'n52.core.mobile.chart-draw-line-toggler',
        bindings: {},
        controller: ['combinedSrvc',
            function(combinedSrvc) {
                combinedSrvc.options.drawLine = false;

                this.$onChanges = function() {
                    this.toggled = combinedSrvc.options.drawLine === true;
                };

                this.toggleDrawLine = function() {
                    this.toggled = combinedSrvc.options.drawLine = !combinedSrvc.options.drawLine;
                };
            }
        ]
    });
