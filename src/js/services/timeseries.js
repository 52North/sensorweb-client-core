angular.module('n52.core.timeseries', ['n52.core.color', 'n52.core.time', 'n52.core.interface', 'n52.core.styleTs'])
        .factory('timeseriesService', ['$rootScope', 'interfaceService', 'statusService', 'timeService', 'styleService',
            function ($rootScope, interfaceService, statusService, timeService, styleService) {
                var timeseries = {};
                var tsData = {};

                // load timeseries from status
                angular.forEach(statusService.getTimeseries(), function (ts) {
                    addTimeseriesById(ts.id, ts.apiUrl);
                });

                $rootScope.$on('timeExtentChanged', function (evt) {
                    _loadAllData();
                });

                function _loadAllData() {
                    // TODO evtl. erst wenn alle Daten da sind soll die Daten auch gesetzt werden???
                    angular.forEach(timeseries, function (ts) {
                        _loadTsData(ts);
                    });
                }

                function _addTs(ts) {
                    styleService.createStylesInTs(ts);
                    timeseries[ts.internalId] = ts;
                    statusService.addTimeseries(ts);
                    _loadTsData(ts);
                }

                function _loadTsData(ts) {
                    ts.loadingData = true;
                    interfaceService.getTsData(ts.id, ts.apiUrl, timeService.getCurrentTimespan()).then(function (data) {
                        _addTsData(data, ts);
                    });
                }

                function _addTsData(data, ts) {
                    tsData[ts.internalId] = data[ts.id];
                    if (tsData[ts.internalId].values && tsData[ts.internalId].values.length) {
                        ts.hasDataInCurrentExtent = false;
                    } else {
                        ts.hasDataInCurrentExtent = true;
                    }
                    $rootScope.$emit('timeseriesDataChanged', ts.internalId);
                    ts.loadingData = false;
                }

                function getData(internalId) {
                    return tsData[internalId];
                }

                function getTimeseries(internalId) {
                    return timeseries[internalId];
                }

                function getAllTimeseries() {
                    return timeseries;
                }

                function hasTimeseries(internalId) {
                    return angular.isObject(timeseries[internalId]);
                }

                function getTimeseriesCount() {
                    return Object.keys(timeseries).length;
                }

                function addTimeseriesById(id, apiUrl, params) {
                    interfaceService.getTimeseries(id, apiUrl, params).then(function (data) {
                        if (angular.isArray(data)) {
                            angular.forEach(data, function (ts) {
                                _addTs(ts, apiUrl);
                            });
                        } else {
                            _addTs(data, apiUrl);
                        }
                    });
                }

                function addTimeseries(ts) {
                    _addTs(angular.copy(ts));
                }

                function removeTimeseries(internalId) {
                    styleService.deleteStyle(timeseries[internalId]);
                    delete timeseries[internalId];
                    delete tsData[internalId];
                    statusService.removeTimeseries(internalId);
                    $rootScope.$emit('timeseriesDataChanged', internalId);
                }

                function removeAllTimeseries() {
                    angular.forEach(timeseries, function (elem) {
                        removeTimeseries(elem.internalId);
                    });
                }

                function toggleReferenceValue(refValue, internalId) {
                    refValue.visible = !refValue.visible;
                    $rootScope.$emit('timeseriesDataChanged', internalId);
                }

                function isTimeseriesVisible(internalId) {
                    return hasTimeseries(internalId) && timeseries[internalId].styles.visible;
                }

                return {
                    addTimeseriesById: addTimeseriesById,
                    addTimeseries: addTimeseries,
                    removeTimeseries: removeTimeseries,
                    removeAllTimeseries: removeAllTimeseries,
                    toggleReferenceValue: toggleReferenceValue,
                    isTimeseriesVisible: isTimeseriesVisible,
                    getData: getData,
                    getTimeseries: getTimeseries,
                    getAllTimeseries: getAllTimeseries,
                    hasTimeseries: hasTimeseries,
                    getTimeseriesCount: getTimeseriesCount,
                    timeseries: timeseries
                };
            }]);