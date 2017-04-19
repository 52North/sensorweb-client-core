angular.module('n52.core.base')
    .service('timeseriesService', ['$rootScope', 'seriesApiInterface', 'statusService', 'styleService', 'settingsService', 'utils',
        function($rootScope, seriesApiInterface, statusService, styleService, settingsService, utils) {

            this.timeseries = {};
            var tsData = {};

            $rootScope.$on('timeExtentChanged', () => {
                _loadAllData(this.timeseries);
            });

            var _loadAllData = function(timeseries) {
                // TODO evtl. erst wenn alle Daten da sind soll die Daten auch gesetzt werden???
                angular.forEach(timeseries, ts => {
                    _loadTsData(ts);
                });
            };

            var _addTs = function(ts, timeseries) {
                ts.internalId = utils.createInternalId(ts);
                if (ts.uom === settingsService.undefinedUomString) {
                    delete ts.uom;
                }
                styleService.createStylesInTs(ts);
                timeseries[ts.internalId] = ts;
                statusService.addTimeseries(ts);
                _loadTsData(ts);
            };

            var _loadTsData = function(ts) {
                var generalizeData = statusService.status.generalizeData || false;
                ts.loadingData = true;
                seriesApiInterface.getTsData(ts.id, ts.apiUrl, utils.createBufferedCurrentTimespan(statusService.getTime()), ts.filter, generalizeData)
                    .then(data => {
                        _addTsData(data, ts);
                    });
            };

            var _addTsData = function(data, ts) {
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

            this.getPhenomenonLabel = function(ts) {
              if (ts.parameters && ts.parameters.phenomenon && ts.parameters.phenomenon.label)
                return ts.parameters.phenomenon.label;
              if (ts.seriesParameters && ts.seriesParameters.phenomenon && ts.seriesParameters.phenomenon.label)
                return ts.seriesParameters.phenomenon.label;
            };

            this.getFeatureLabel = function(ts) {
                if (ts.parameters && ts.parameters.feature && ts.parameters.feature.label)
                  return ts.parameters.feature.label;
                if (ts.seriesParameters && ts.seriesParameters.feature && ts.seriesParameters.feature.label)
                  return ts.seriesParameters.feature.label;
            };
        }
    ]);
