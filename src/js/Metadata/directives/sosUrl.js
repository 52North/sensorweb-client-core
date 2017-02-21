angular.module('n52.core.metadata')
    .component('swcSosUrl', {
        bindings: {
            timeseries: '<'
        },
        templateUrl: 'n52.core.metadata.sos-url',
        controller: 'SwcSosUrlCtrl'
    })
    .controller('SwcSosUrlCtrl', ['sosUrlSrv', '$window',
        function(sosUrlSrv, $window) {
            this.sos = {};
            this.openCapabilities = function() {
                $window.open(this.sos.url + '?request=GetCapabilities&service=SOS');
            };
            this.$onInit = function() {
                sosUrlSrv.getSosUrl(this.timeseries, this.sos);
            };
        }
    ]);
