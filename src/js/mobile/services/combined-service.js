angular.module('n52.core.mobile')
    .service('combinedSrvc', ['seriesApiInterface', 'statusService', '$location', '$q',
        function(seriesApiInterface, statusService, $location, $q) {
            this.options = {
                axisType: 'distance'
            };
            this.selectedSection = {
                values: []
            };
            this.coordinates = {
                values: []
            };
            this.data = {
                values: []
            };
            this.series = {};

            this.loadSeries = function(id, url) {
                return $q((resolve, reject) => {
                    this.series.providerUrl = url;
                    statusService.status.mobile = {
                        id: id,
                        url: url
                    };
                    this.series.loading = true;
                    seriesApiInterface.getDatasets(id, url, {
                            cache: false
                        })
                        .then(s => {
                            angular.extend(this.series, s);
                            var timespan = {
                                start: s.firstValue.timestamp,
                                end: s.lastValue.timestamp
                            };
                            seriesApiInterface.getDatasetData(s.id, url, timespan, {
                                    expanded: true
                                })
                                .then(data => {
                                    this.processData(data[id].values);
                                    this.series.loading = false;
                                    resolve();
                                });
                        }, () => {
                            this.series.label = 'Error while loading dataset';
                            this.series.loading = false;
                            reject();
                        });
                });
            };

            this.processData = function(data) {
                this.resetCoordinates();
                this.resetData();
                for (var i = 0; i < data.length; i++) {
                    this.addToCoordinates(data[i]);
                    this.addToData(data[i], data[i ? i - 1 : 0], i);
                }
            };

            this.addToCoordinates = function(entry) {
                this.coordinates.values.push(entry.geometry.coordinates);
            };

            this.addToData = function(entry, previous, idx) {
                var s = new L.LatLng(entry.geometry.coordinates[1], entry.geometry.coordinates[0]);
                var e = new L.LatLng(previous.geometry.coordinates[1], previous.geometry.coordinates[0]);
                var newdist = s.distanceTo(e);
                this.data.dist = this.data.dist + Math.round(newdist / 1000 * 100000) / 100000;
                this.data.values.push({
                    tick: idx,
                    dist: Math.round(this.data.dist * 10) / 10,
                    timestamp: entry.timestamp,
                    value: entry.value,
                    x: entry.geometry.coordinates[0],
                    y: entry.geometry.coordinates[1],
                    latlng: s
                });
            };

            this.resetCoordinates = function() {
                this.coordinates.values = [];
            };

            this.resetData = function() {
                this.data.values = [];
                this.data.dist = 0;
            };

            this.findItemIdxForLatLng = function(latlng) {
                var result = null,
                    d = Infinity;
                angular.forEach(this.data.values, function(item, idx) {
                    var dist = latlng.distanceTo(item.latlng);
                    if (dist < d) {
                        d = dist;
                        result = idx;
                    }
                });
                return result;
            };

            this.highlightByIdx = function(idx) {
                this.options.highlightIdx = idx;
            };

            this.showHighlightedItem = function(latlng) {
                this.options.highlightIdx = this.findItemIdxForLatLng(latlng);
            };

            this.setSelection = function(startIdx, endIdx) {
                var start = Math.min(startIdx, endIdx),
                    end = Math.max(startIdx, endIdx);
                this.selectedSection.offset = start;
                this.selectedSection.values = this.data.values.slice(start, end);
            };

            this.setAxis = function(axisType) {
                this.options.axisType = axisType;
            };

            this.resetSelection = function() {
                this.selectedSection.offset = 0;
                this.selectedSection.values = [];
            };

            var parameters = $location.search();
            if (parameters.datasetId && parameters.providerUrl) {
                this.loadSeries(parameters.datasetId, parameters.providerUrl);
            } else if (statusService.status.mobile) {
                let lastEntry = statusService.status.mobile;
                if (lastEntry.id && lastEntry.url) {
                    this.loadSeries(lastEntry.id, lastEntry.url);
                }
            }
        }
    ]);
