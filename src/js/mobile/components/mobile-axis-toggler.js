angular.module('n52.core.mobile')
    .component('swcMobileAxisToggler', {
        templateUrl: 'n52.core.mobile.axis-toggler',
        bindings: {
            axisType: '@',
            icon: '@',
            tooltip: '@',
            selectedAxisType: '<'
        },
        controller: ['combinedSrvc',
            function(combinedSrvc) {
                this.$onChanges = function() {
                    this.toggled = combinedSrvc.options.axisType === this.axisType;
                };

                this.toggleAxis = function() {
                    combinedSrvc.setAxis(this.axisType);
                    this.toggled = combinedSrvc.options.axisType === this.axisType;
                };
            }
        ]
    });
