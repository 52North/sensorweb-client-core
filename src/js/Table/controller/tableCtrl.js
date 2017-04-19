angular.module('n52.core.table')
    .controller('SwcTableCtrl', ['$scope', '$filter', 'ngTableParams', 'timeseriesService', 'timeService', '$rootScope', '$translate',
        function($scope, $filter, ngTableParams, timeseriesService, timeService, $rootScope, $translate) {
            // http://ngmodules.org/modules/ng-table
            var createValueArray = function() {
                var array = [];
                var map = {};
                angular.forEach(timeseriesService.getAllTimeseries(), function(ts) {
                    var data = timeseriesService.getData(ts.internalId);
                    if (data.values.length > 0) {
                        var values = removeOverlappingValues(data.values);
                        angular.forEach(values, function(pair) {
                            var time = pair[0];
                            var value = pair[1];
                            if (!map[time]) {
                                map[time] = {
                                    time: time
                                };
                            }
                            map[time][ts.internalId] = value;
                        });
                    }
                });
                var i = 0;
                angular.forEach(map, function(entry) {
                    array[i++] = entry;
                });
                return array;
            };
            var createColumns = function() {
                var columns = [];
                columns.push({
                    phenomenon: $translate.instant('table.time'),
                    field: 'time',
                    visible: true
                });
                angular.forEach(timeseriesService.getAllTimeseries(), function(ts) {
                    var phenomenonLabel = timeseriesService.getPhenomenonLabel(ts);
                    if (ts.uom) {
                        phenomenonLabel += ' (' + ts.uom + ')';
                    }
                    columns.push({
                        station: timeseriesService.getFeatureLabel(ts),
                        phenomenon: phenomenonLabel,
                        field: ts.internalId,
                        color: ts.styles.color,
                        isActive: ts.isActive
                    });
                });
                return columns;
            };
            var createTable = function() {
                $scope.tableParams = new ngTableParams({
                    page: 1,
                    count: 30,
                    sorting: {
                        time: 'asc'
                    }
                }, {
                    total: data.length,
                    counts: [],
                    getData: function($defer, params) {
                        var orderedData = params.sorting() ?
                            $filter('orderBy')(data, params.orderBy()) :
                            data;
                        $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                    }
                });
            };
            var removeOverlappingValues = function(values) {
                // remove values before start
                var start = timeService.getStartInMillies();
                var count = 0;
                while (values[count][0] < start)
                    count++;
                values.splice(0, count);
                // remove values after the end
                var idx = values.length - 1;
                var end = timeService.getEndInMillies();
                count = 0;
                while (values[idx][0] > end) {
                    count++;
                    idx--;
                }
                values.splice(++idx, count);
                return values;
            };
            $scope.loadMoreData = function() {
                $scope.tableParams.count($scope.tableParams.count() + 10);
                $scope.tableParams.reload();
            };
            var timeseriesChangedListener = $rootScope.$on('timeseriesChanged', function() {
                data = createValueArray();
                $scope.columns = createColumns();
            });
            var alltimeseriesChangedListener = $rootScope.$on('allTimeseriesChanged', function() {
                data = createValueArray();
                $scope.columns = createColumns();
            });
            var timeseriesDataChangedListener = $rootScope.$on('timeseriesDataChanged', function() {
                data = createValueArray();
                $scope.columns = createColumns();
                $scope.tableParams.reload();
            });
            $scope.columns = createColumns();
            $scope.$on('$destroy', function() {
                timeseriesChangedListener();
                timeseriesDataChangedListener();
                alltimeseriesChangedListener();
            });
            var data = createValueArray();
            createTable();
        }
    ]);
