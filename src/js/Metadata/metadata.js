angular.module('n52.core.metadata', [])
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
