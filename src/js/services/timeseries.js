angular.module('n52.core.timeseries', [])
        .factory('timeseriesService', ['$rootScope', 'interfaceService', 'statusService', 'styleService', 'settingsService', 'utils',
            function ($rootScope, interfaceService, statusService, styleService, settingsService, utils) {
                var defaultDuration = settingsService.timeseriesDataBuffer || moment.duration(2, 'h');

                var timeseries = {};
                var tsData = {};

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
                    ts.timebuffer = defaultDuration;
                    styleService.createStylesInTs(ts);
                    timeseries[ts.internalId] = ts;
                    statusService.addTimeseries(ts);
                    _loadTsData(ts);
                }

                function _loadTsData(ts) {
                    ts.loadingData = true;
                    interfaceService.getTsData(ts.id, ts.apiUrl, utils.createBufferedCurrentTimespan(statusService.getTime(), ts.timebuffer))
                            .then(function (data) {
                                _addTsData(data, ts);
                            });
                }

                function _createNewTimebuffer(data) {
                    if (data.length >= 2) {
                        var newDuration = moment.duration(data[1][0] - data[0][0]);
                        if (newDuration > defaultDuration) {
                            return newDuration;
                        } else {
                            return defaultDuration;
                        }
                    }
                    return defaultDuration;
                }

                function _addTsData(data, ts) {
                    ts.timebuffer = _createNewTimebuffer(data[ts.id].values);
                    tsData[ts.internalId] = data[ts.id];
                    if (tsData[ts.internalId].values && tsData[ts.internalId].values.length) {
                        ts.hasNoDataInCurrentExtent = false;
                    } else {
                        ts.hasNoDataInCurrentExtent = true;
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