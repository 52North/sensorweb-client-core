angular.module('n52.core.base')
    .service('timeseriesService', ['$rootScope', 'seriesApiInterface', 'statusService', 'styleService', 'settingsService', 'utils',
        function($rootScope, seriesApiInterface, statusService, styleService, settingsService, utils) {
            var defaultDuration = settingsService.timeseriesDataBuffer || moment.duration(2, 'h');

            this.timeseries = {};
            var tsData = {};

            $rootScope.$on('timeExtentChanged', evt => {
                _loadAllData(this.timeseries);
            });

            _loadAllData = function(timeseries) {
                // TODO evtl. erst wenn alle Daten da sind soll die Daten auch gesetzt werden???
                angular.forEach(timeseries, ts => {
                    _loadTsData(ts);
                });
            };

            _addTs = function(ts, timeseries) {
                ts.internalId = utils.createInternalId(ts.id, ts.apiUrl);
                if (ts.uom === settingsService.undefinedUomString) {
                    delete ts.uom;
                }
                ts.timebuffer = defaultDuration;
                styleService.createStylesInTs(ts);
                timeseries[ts.internalId] = ts;
                statusService.addTimeseries(ts);
                _loadTsData(ts);
            };

            _loadTsData = function(ts) {
                var generalizeData = statusService.status.generalizeData || false;
                ts.loadingData = true;
                seriesApiInterface.getTsData(ts.id, ts.apiUrl, utils.createBufferedCurrentTimespan(statusService.getTime(), ts.timebuffer), ts.filter, generalizeData)
                    .then(data => {
                        _addTsData(data, ts);
                    });
            };

            _createNewTimebuffer = function(data) {
                if (data.length >= 2) {
                    var newDuration = moment.duration(data[1][0] - data[0][0]);
                    if (newDuration > defaultDuration) {
                        return newDuration;
                    } else {
                        return defaultDuration;
                    }
                }
                return defaultDuration;
            };

            _addTsData = function(data, ts) {
                ts.timebuffer = _createNewTimebuffer(data[ts.id].values);
                tsData[ts.internalId] = data[ts.id];
                if (tsData[ts.internalId].values && tsData[ts.internalId].values.length) {
                    ts.hasNoDataInCurrentExtent = false;
                } else {
                    ts.hasNoDataInCurrentExtent = true;
                }
                $rootScope.$emit('timeseriesDataChanged', ts.internalId);
                ts.loadingData = false;
            };

            this.getData = function(internalId) {
                return tsData[internalId];
            };

            this.getTimeseries = function(internalId) {
                return this.timeseries[internalId];
            };

            this.getAllTimeseries = function() {
                return this.timeseries;
            };

            this.hasTimeseries = function(internalId) {
                return angular.isObject(this.timeseries[internalId]);
            };

            this.getTimeseriesCount = function() {
                return Object.keys(this.timeseries).length;
            };

            this.addTimeseriesById = function(id, apiUrl, params) {
                seriesApiInterface.getTimeseries(id, apiUrl, params).then((data) => {
                    if (angular.isArray(data)) {
                        angular.forEach(data, ts => {
                            _addTs(ts, this.timeseries);
                        });
                    } else {
                        _addTs(data, this.timeseries);
                    }
                });
            };

            this.addTimeseries = function(ts) {
                _addTs(angular.copy(ts), this.timeseries);
            };

            this.removeTimeseries = function(internalId) {
                styleService.deleteStyle(this.timeseries[internalId]);
                delete this.timeseries[internalId];
                delete tsData[internalId];
                statusService.removeTimeseries(internalId);
                $rootScope.$emit('timeseriesDataChanged', internalId);
            };

            this.removeAllTimeseries = function() {
                angular.forEach(this.timeseries, elem => {
                    this.removeTimeseries(elem.internalId);
                });
            };

            this.toggleReferenceValue = function(refValue, internalId) {
                refValue.visible = !refValue.visible;
                $rootScope.$emit('timeseriesDataChanged', internalId);
            };

            this.isTimeseriesVisible = function(internalId) {
                return this.hasTimeseries(internalId) && this.timeseries[internalId].styles.visible;
            };
        }
    ]);
