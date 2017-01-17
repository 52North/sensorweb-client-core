angular.module('n52.core.startup', [])
        .service('startupService', ['$injector', '$log',
            function ($injector, $log) {
                var startupServices = [];

                this.registerServices = function (services) {
                    startupServices = services;
                };

                this.checkServices = function () {
                    angular.forEach(startupServices, function (serviceString) {
                        var service = $injector.get(serviceString);
                        if (angular.isFunction(service.setsParameters)) {
                            service.setsParameters();
                        } else {
                            $log.error(serviceString + ' has no setsParameters method!');
                        }
                    });
                };
            }]);
