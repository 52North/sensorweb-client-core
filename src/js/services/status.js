angular.module('n52.core.status', [])
    .factory('statusService', ['$rootScope', 'localStorageService', 'settingsService',
        function($rootScope, localStorageService, settingsService) {
            var lastBuild = 1,
                defStatus,
                storageKey = 'status',
                // set status to rootscope:
                scope = $rootScope;

            if (document.head.querySelector("[property=lastBuild]")) {
                lastBuild = document.head.querySelector("[property=lastBuild]").content;
            }

            // init default status
            function initDefStatus() {

                defStatus = {
                    lastBuild: lastBuild,
                    apiProvider: settingsService.defaultProvider,
                    showLegend: settingsService.showLegendOnStartup || false,
                    showPhenomena: settingsService.showPhenomenaListOnStartup || false,
                    saveStatus: settingsService.saveStatus,
                    generalizeData: settingsService.generalizeData,
                    clusterStations: settingsService.clusterStations,
                    concentrationMarker: settingsService.concentrationMarker,
                    timeseries: {},
                    timespan: {}
                };

                if (!settingsService.defaultStartTimeExtent) {

                    defStatus.timespan.duration = moment.duration(1, 'day');
                    defStatus.timespan.end = moment();
                    defStatus.timespan.start = moment(defStatus.timespan.end).subtract(defStatus.timespan.duration);

                } else {

                    defStatus.timespan.duration = settingsService.defaultStartTimeExtent.duration || moment.duration(1, 'day');
                    defStatus.timespan.end = settingsService.defaultStartTimeExtent.end || moment();
                    defStatus.timespan.start = settingsService.defaultStartTimeExtent.start || moment(defStatus.timespan.end).subtract(defStatus.timespan.duration);
                }
            }

            initDefStatus();

            // load status from storage
            var storage = localStorageService.get(storageKey) || {};
            if (storage.lastBuild == lastBuild) {
                scope.status = angular.extend(angular.copy(defStatus), storage);
            } else {
                scope.status = defStatus;
            }

            scope.$watch('status', function(newStatus) {
                if (newStatus.saveStatus) {
                    localStorageService.set(storageKey, newStatus);
                } else {
                    localStorageService.remove(storageKey);
                }
            }, true);

            var resetStatus = function() {
                angular.copy(defStatus, scope.status);
            };

            var removeTimeseries = function(internalId) {
                delete scope.status.timeseries[internalId];
            };

            var removeAllTimeseries = function() {
                angular.forEach(scope.status.timeseries, function(ts, id) {
                    removeTimeseries(id);
                });
            };

            var addTimeseries = function(timeseries) {
                scope.status.timeseries[timeseries.internalId] = timeseries;
            };

            var getTimeseries = function() {
                return scope.status.timeseries;
            };

            var getTime = function() {
                return scope.status.timespan;
            };

            var setTime = function(time) {
                scope.status.timespan = time;
            };

            return {
                resetStatus: resetStatus,
                addTimeseries: addTimeseries,
                removeAllTimeseries: removeAllTimeseries,
                removeTimeseries: removeTimeseries,
                getTimeseries: getTimeseries,
                getTime: getTime,
                setTime: setTime,
                status: scope.status
            };
        }
    ]);
