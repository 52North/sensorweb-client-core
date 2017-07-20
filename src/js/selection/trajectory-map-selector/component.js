require('../selection');

angular.module('n52.core.selection')
    .component('swcTrajectoryMapSelector', {
        bindings: {
            mapId: '@',
            serviceUrl: '<',
            filter: '<',
            mapLayers: '<',
            selectedTimespan: '<',
            geometrySelected: '&onGeometrySelected',
            timeListDetermined: '&onTimeListDetermined'
        },
        templateUrl: 'n52.core.selection.platform-map-selector',
        controller: ['seriesApiInterface', '$scope', 'leafletData',
            function(seriesApiInterface, $scope, leafletData) {

                var defaultStyle = {
                    color: 'red',
                    weight: 5,
                    opacity: 0.65
                };

                var hightlightStyle = {
                    color: 'blue',
                    weight: 7,
                    opacity: 1
                };

                var layer;
                var init = false;

                var initMap = (callback) => {
                    if (!init) {
                        setTimeout(() => {
                            leafletData.getMap(this.mapId).then((map) => {
                                map.invalidateSize();
                                if (callback) callback();
                            });
                        }, 10);
                    } else {
                        if (callback) callback();
                    }
                };

                var clearMap = (map) => {
                    if (layer) map.removeLayer(layer);
                };

                var initLayer = () => {
                    layer = L.markerClusterGroup({
                        animate: false
                    });
                };

                var createGeoJson = (entry, map) => {
                    var geojson = L.geoJson(entry.geometry);
                    geojson.setStyle(defaultStyle);
                    geojson.addTo(map);
                    geojson.on('click', () => {
                        this.geometrySelected({
                            dataset: this.dataset,
                            selectedGeometry: entry
                        });
                    });
                    geojson.on('mouseover', () => {
                        geojson.setStyle(hightlightStyle);
                        geojson.bringToFront();
                    });
                    geojson.on('mouseout', () => {
                        geojson.setStyle(defaultStyle);
                    });
                    return geojson;
                };

                this.$onInit = () => {
                    initMap();
                };

                this.$onChanges = (changes) => {
                    if (changes.selectedTimespan && changes.selectedTimespan.currentValue) {
                        leafletData.getMap(this.mapId).then((map) => {
                            clearMap(map);
                            initLayer();
                            this.data.forEach(entry => {
                                if (this.selectedTimespan.start <= entry.timestamp && entry.timestamp <= this.selectedTimespan.end) {
                                    var geojson = createGeoJson(entry, map);
                                    layer.addLayer(geojson);
                                }
                            });
                            layer.addTo(map);
                        });
                    }
                    if (changes.filter) {
                        initMap(() => {
                            this.loading = true;
                            leafletData.getMap(this.mapId).then((map) => {
                                clearMap(map);
                                // add geometries to layer
                                seriesApiInterface.getDatasets(null, this.serviceUrl, this.filter)
                                    .then((dataset) => {
                                        if (dataset instanceof Array && dataset.length === 1) {
                                            this.dataset = dataset[0];
                                            var timespan = {
                                                start: this.dataset.firstValue.timestamp,
                                                end: this.dataset.lastValue.timestamp
                                            };
                                            seriesApiInterface.getDatasetData(this.dataset.id, this.serviceUrl, timespan)
                                                .then(data => {
                                                    if (data.values instanceof Array) {
                                                        initLayer();
                                                        this.data = [];
                                                        var timelist = [];
                                                        data.values.forEach(entry => {
                                                            this.data.push(entry);
                                                            var geojson = createGeoJson(entry, map);
                                                            timelist.push(entry.timestamp);
                                                            layer.addLayer(geojson);
                                                        });
                                                        this.timeListDetermined({
                                                            timelist
                                                        });
                                                        layer.addTo(map);
                                                        map.fitBounds(layer.getBounds());
                                                    }
                                                    this.loading = false;
                                                });
                                        }
                                    });
                            });
                        });
                    }
                };
            }
        ]
    });
