angular.module('n52.core.metadata', [])
    .service('sosUrlSrv', ['seriesApiInterface',
        function(seriesApiInterface) {
            this.getSosUrl = function(timeseries, sos) {
                if (timeseries) {
                    var id = timeseries.parameters.service.id,
                        apiUrl = timeseries.apiUrl;
                    seriesApiInterface.getServices(apiUrl, id).then(function(service) {
                        if (service.type === 'SOS') {
                            sos.url = service.serviceUrl;
                        }
                    });
                }
            };
        }
    ]);
