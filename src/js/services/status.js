angular.module('statusModule', ['LocalStorageModule', 'settingsModule'])
        .factory('statusService', ['$rootScope', 'localStorageService', 'settingsService', 'permalinkEvaluationService',
            function ($rootScope, localStorageService, settingsService, permalinkEvaluationService) {
                var storageKey = 'status';

                // init default status
                var defStatus = {
                    apiProvider: {
                        url: 'http://www.fluggs.de/sos2/api/v1/',
                        serviceID: '1'
                    },
                    showLegend: false,
                    showPhenomena: false,
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

                // extend status with possible permalink options
                var permalinkTime = permalinkEvaluationService.getTime();
                if (permalinkTime)
                    scope.status.timespan = permalinkTime;

                var permalinkTimeseries = permalinkEvaluationService.getTimeseries();
                if (permalinkTimeseries)
                    scope.status.timeseries = permalinkTimeseries;

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

                addTimeseries = function (timeseries) {
                    scope.status.timeseries[timeseries.internalId] = timeseries;
                };

                getTimeseries = function () {
                    return scope.status.timeseries;
                };

                return {
                    resetStatus: resetStatus,
                    addTimeseries: addTimeseries,
                    removeTimeseries: removeTimeseries,
                    getTimeseries: getTimeseries,
                    status: scope.status
                };
            }]);