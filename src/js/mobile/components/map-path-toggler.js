angular.module('n52.core.mobile')
    .component('swcMobileMapPathToggler', {
        templateUrl: 'n52.core.mobile.map-path-toggler',
        bindings: {},
        controller: ['combinedSrvc',
            function(combinedSrvc) {
                combinedSrvc.options.mapPath = false;

                this.$onChanges = function() {
                    this.toggled = !combinedSrvc.options.mapPath;
                };

                this.toggleMapPath = function() {
                    combinedSrvc.options.mapPath = !combinedSrvc.options.mapPath;
                    this.toggled = !combinedSrvc.options.mapPath;
                };
            }
        ]
    });
