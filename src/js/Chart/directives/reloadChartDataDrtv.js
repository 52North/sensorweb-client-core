angular.module('n52.core.diagram')
    .directive('swcReloadButton', [
        function() {
            return {
                restrict: 'E',
                templateUrl: 'n52.core.diagram.reload-button',
                controller: 'SwcReloadButtonCtrl'
            };
        }
    ])
    .controller('SwcReloadButtonCtrl', ['$scope', 'statusService', 'refreshDataSrvc', 'timeService',
        function($scope, statusService, refreshDataSrvc, timeService) {
            if (angular.isUndefined(statusService.status.reloadChartData)) {
                statusService.status.reloadChartData = false;
            }
            $scope.time = timeService.time;
            $scope.reload = statusService.status.reloadChartData;
            refreshDataSrvc.reloadData();

            $scope.$watch('time', function() {
                refreshDataSrvc.timeExtentChanged();
            }, true);

            $scope.toggleReload = function() {
                $scope.reload = statusService.status.reloadChartData = !statusService.status.reloadChartData;
                refreshDataSrvc.reloadData();
            };
            $scope.$on('$destroy', function() {
                refreshDataSrvc.stopReloadingData();
            });
        }
    ])
    .directive('swcRefreshTime', [
        function() {
            return {
                restrict: 'E',
                templateUrl: 'n52.core.diagram.refresh-time',
                controller: 'SwcLastRefreshCtrl'
            };
        }
    ])
    .controller('SwcLastRefreshCtrl', ['$scope', 'refreshDataSrvc', function($scope, refreshDataSrvc) {
        $scope.lastRefresh = refreshDataSrvc.lastRefresh;
    }])
    .service('refreshDataSrvc', ['$cacheFactory', 'settingsService', '$rootScope', '$interval', 'statusService', 'timeseriesService',
        function($cacheFactory, settingsService, $rootScope, $interval, statusService, timeseriesService) {
            this.lastRefresh = {};
            var reloadPromise,
                refreshInterval = settingsService.refreshDataInterval ? settingsService.refreshDataInterval : 60000;

            this.timeExtentChanged = () => {
                this.lastRefresh.time = new Date();
            };

            this.refreshData = () => {
                $cacheFactory.get('$http').removeAll();
                timeseriesService.timeChanged();
            };

            this.reloadData = () => {
                this.stopReloadingData();
                if (statusService.status.reloadChartData) {
                    this.refreshData();
                    reloadPromise = $interval(() => {
                        this.refreshData();
                    }, refreshInterval);
                }
            };

            this.stopReloadingData = () => {
                $interval.cancel(reloadPromise);
            };
        }
    ]);
