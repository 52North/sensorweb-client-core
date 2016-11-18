'use strict';
angular.module('n52.core.sosMetadata', [])
    .component('swcSosUrl', {
        bindings: {
            timeseries: "<"
        },
        templateUrl: "templates/metadata/sos-url.html",
        controller: 'SwcSosUrlCtrl'
    })
    .controller('SwcSosUrlCtrl', ['sosUrlSrv', '$window',
        function(sosUrlSrv, $window) {
            this.sos = {};
            this.openCapabilities = function() {
                $window.open(this.sos.url + '?request=GetCapabilities&service=SOS');
            };
            sosUrlSrv.getSosUrl(this.timeseries, this.sos);
        }
    ])
    .service('sosUrlSrv', ['interfaceService',
        function(interfaceService) {
            this.getSosUrl = function(timeseries, sos) {
                var id = timeseries.parameters.service.id,
                    apiUrl = timeseries.apiUrl;
                interfaceService.getServices(apiUrl, id).then(function(service) {
                    if (service.type === 'SOS') {
                        sos.url = service.serviceUrl;
                    }
                });
            };
        }
    ]);
