angular.module('n52.core.logging', [])
        .config(['$provide',
            function ($provide) {
                $provide.decorator('$log', ['$delegate', 'Logging',
                    function ($delegate, Logging) {
                        var methods =
                                {
                                    error: function () {
                                        if (Logging.enabled) {
                                            $delegate.error.apply(null, arguments);
                                            Logging.error.apply(null, arguments);
                                        }
                                    },
                                    log: function () {
                                        if (Logging.enabled) {
                                            $delegate.log.apply(null, arguments);
                                            Logging.log.apply(null, arguments);
                                        }
                                    },
                                    info: function () {
                                        if (Logging.enabled) {
                                            $delegate.info.apply(null, arguments);
                                            Logging.info.apply(null, arguments);
                                        }
                                    },
                                    warn: function () {
                                        if (Logging.enabled) {
                                            $delegate.warn.apply(null, arguments);
                                            Logging.warn.apply(null, arguments);
                                        }
                                    }
                                };
                        return methods;
                    }]);
            }])
        .service('Logging', ['$injector', 'settingsService',
            function ($injector, settingsService) {
                var logLevel = settingsService.logLevel ? settingsService.logLevel : 0;
                var service = {
                    error: function () {
                        self.type = 'error';
                        if (logLevel >= 1) log.apply(self, arguments);
                    },
                    warn: function () {
                        self.type = 'warn';
                        if (logLevel >= 2) log.apply(self, arguments);
                    },
                    info: function () {
                        self.type = 'info';
                        if (logLevel >= 3) log.apply(self, arguments);
                    },
                    log: function () {
                        self.type = 'log';
                        if (logLevel >= 4) log.apply(self, arguments);
                    },
                    enabled: settingsService.logging ? settingsService.logging : true,
                    logLevel: 'error'
                };

                var log = function (message) {
                    var notifier = $injector.get('Notification');
                    notifier.error(message);
                };
                return service;
            }]);