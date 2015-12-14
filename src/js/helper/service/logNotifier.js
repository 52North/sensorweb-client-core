angular.module('n52.core.helper')
        .config(['$provide',
            function ($provide) {
                $provide.decorator('$log', ['$delegate', 'Logging',
                    function ($delegate, Logging) {
                        var oldError = $delegate.error;
                        $delegate.error = function () {
                            if (Logging.enabled) {
                                oldError.apply(null, arguments);
                                Logging.error.apply(null, arguments);
                            }
                        };

                        var oldLog = $delegate.log;
                        $delegate.log = function () {
                            if (Logging.enabled) {
                                oldLog.apply(null, arguments);
                                Logging.log.apply(null, arguments);
                            }
                        };

                        var oldInfo = $delegate.info;
                        $delegate.info = function () {
                            if (Logging.enabled) {
                                oldInfo.apply(null, arguments);
                                Logging.info.apply(null, arguments);
                            }
                        };

                        var oldWarn = $delegate.warn;
                        $delegate.warn = function () {
                            if (Logging.enabled) {
                                oldWarn.apply(null, arguments);
                                Logging.warn.apply(null, arguments);
                            }
                        };
                        return $delegate;
                    }]);
            }])
        .service('Logging', ['$injector', 'settingsService',
            function ($injector, settingsService) {
                var logLevel = settingsService.logLevel ? settingsService.logLevel : 0;
                var service = {
                    error: function () {
                        self.type = 'error';
                        if (logLevel >= 1)
                            log.apply(self, arguments);
                    },
                    warn: function () {
                        self.type = 'warn';
                        if (logLevel >= 2)
                            log.apply(self, arguments);
                    },
                    info: function () {
                        self.type = 'info';
                        if (logLevel >= 3)
                            log.apply(self, arguments);
                    },
                    log: function () {
                        self.type = 'log';
                        if (logLevel >= 4)
                            log.apply(self, arguments);
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