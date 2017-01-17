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
    .controller('SwcReloadButtonCtrl', ['$scope', 'statusService', 'refreshDataSrvc',
        function($scope, statusService, refreshDataSrvc) {
            if (angular.isUndefined(statusService.status.reloadChartData)) {
                statusService.status.reloadChartData = false;
            }
            $scope.reload = statusService.status.reloadChartData;
            refreshDataSrvc.reloadData();

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
    .factory('refreshDataSrvc', ['$cacheFactory', 'settingsService', '$rootScope', '$interval', 'statusService',
        function($cacheFactory, settingsService, $rootScope, $interval, statusService) {
            var reloadPromise,
                lastRefresh = {},
                refreshInterval = settingsService.refreshDataInterval ? settingsService.refreshDataInterval : 60000;

            $rootScope.$on('timeExtentChanged', function() {
                lastRefresh.time = new Date();
            });

            function refreshData() {
                $cacheFactory.get('$http').removeAll();
                $rootScope.$emit('timeExtentChanged');
            }

            function reloadData() {
                stopReloadingData();
                if (statusService.status.reloadChartData) {
                    refreshData();
                    reloadPromise = $interval(function() {
                        refreshData();
                    }, refreshInterval);
                }
            }

            function stopReloadingData() {
                $interval.cancel(reloadPromise);
            }

            return {
                lastRefresh: lastRefresh,
                reloadData: reloadData,
                stopReloadingData: stopReloadingData
            };
        }
    ]);
