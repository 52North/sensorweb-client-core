angular.module('n52.core.mobile')
    .service('combinedSrvc', ['seriesApiInterface', 'statusService', '$location', '$q', 'colorService',
        function(seriesApiInterface, statusService, $location, $q, colorService) {
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
            this.additionalDatasets = [];

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

            this.setPhenomenaSelection = function(phenomenaList) {
                if (phenomenaList.length == 0) {
                    this.options.dataChanges = !this.options.dataChanges;
                }
                this.additionalDatasets.length = 0;
                var datasetPromises = [];
                phenomenaList.forEach(phenomenon => {
                    if (phenomenon !== this.series.seriesParameters.phenomenon.id) {
                        datasetPromises.push(seriesApiInterface.getDatasets(null, this.series.providerUrl, {
                            features: this.series.seriesParameters.feature.id,
                            phenomena: phenomenon,
                            expanded: true
                        }));
                    }
                });

                $q.all(datasetPromises).then((result) => {
                    // for (var i = 0; i < result.length; i++) {
                    //     if (result[i].length === 1) {
                    //         var entry = result[i][0];
                    //         var timespan = {
                    //             start: entry.firstValue.timestamp,
                    //             end: entry.lastValue.timestamp
                    //         };
                    //         getData(entry, timespan, this);
                    //     }
                    // }
                    var i = 0;
                    var intervalId = setInterval(() => {
                        if(result.length > i && result[i].length === 1) {
                            var entry = result[i][0];
                            var timespan = {
                                start: entry.firstValue.timestamp,
                                end: entry.lastValue.timestamp
                            };
                            getData(entry, timespan, this);
                        } else {
                            clearInterval(intervalId);
                        }
                        i++;
                    }, 100);
                });
            };

            function getData(dataset, timespan, that) {
                seriesApiInterface.getDatasetData(dataset.id, that.series.providerUrl, timespan, {
                    expanded: true
                }).then((data) => {
                    that.additionalDatasets.push({
                        id: dataset.id,
                        uom: dataset.uom,
                        color: colorService.getColor(dataset.id)
                    });
                    that.data.values.forEach((entry, idx) => {
                        entry[dataset.id] = data[dataset.id].values[idx].value;
                    });
                    that.options.dataChanges = !that.options.dataChanges;
                });
            }

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
