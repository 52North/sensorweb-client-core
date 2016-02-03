angular.module('n52.core.status', [])
        .factory('statusService', ['$rootScope', 'localStorageService', 'settingsService',
            function ($rootScope, localStorageService, settingsService) {
                var storageKey = 'status';

                // init default status
                var defStatus = {
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
                defStatus.timespan.duration = settingsService.defaultStartTimeExtent.duration || moment.duration(1, 'day');
                defStatus.timespan.end = settingsService.defaultStartTimeExtent.end || moment();
                defStatus.timespan.start = settingsService.defaultStartTimeExtent.start || moment(defStatus.timespan.end).subtract(defStatus.timespan.duration);

                // set status to rootscope:
                var scope = $rootScope;

                // load status from storage
                var storage = localStorageService.get(storageKey) || {};
                scope.status = angular.extend(angular.copy(defStatus), storage);

                scope.$watch('status', function (newStatus) {
                    if (newStatus.saveStatus) {
                        localStorageService.set(storageKey, newStatus);
                    } else {
                        localStorageService.remove(storageKey);
                    }
                }, true);

                resetStatus = function () {
                    angular.copy(defStatus, scope.status);
                };

                removeTimeseries = function (internalId) {
                    delete scope.status.timeseries[internalId];
                };

                removeAllTimeseries = function () {
                    angular.forEach(scope.status.timeseries, function (ts, id) {
                        removeTimeseries(id);
                    });
                };

                addTimeseries = function (timeseries) {
                    scope.status.timeseries[timeseries.internalId] = timeseries;
                };

                getTimeseries = function () {
                    return scope.status.timeseries;
                };

                getTime = function () {
                    return scope.status.timespan;
                };
                
                setTime = function (time) {
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
            }]);