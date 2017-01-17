angular.module('n52.core.provider')
    .component('swcAddProvider', {
        templateUrl: 'n52.core.provider.add-provider',
        controller: ['providerService', '$timeout',
            function(providerService, $timeout) {
                var ctrl = this;
                ctrl.load = {};
                //ctrl.providerUrl = 'http://sensorweb.demo.52north.org/sensorwebclient-webapp-stable/api/v1/';
                ctrl.addProvider = function() {
                    providerService.addProvider(ctrl.providerUrl)
                        .then(res => {
                            ctrl.addSuccessful();
                        }, error => {
                            ctrl.unsuccessful();
                        });
                };

                ctrl.addSuccessful = function() {
                    ctrl.load.successful = true;
                    $timeout(() => {
                        ctrl.load.successful = false;
                    }, 2000);
                };

                ctrl.unsuccessful = function() {
                    ctrl.load.failed = true;
                    $timeout(() => {
                        ctrl.load.failed = false;
                    }, 2000);
                };
            }
        ]
    });
