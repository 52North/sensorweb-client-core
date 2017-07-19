require('../selection');

angular.module('n52.core.selection')
    .component('swcTrajectoryMapSelector', {
        bindings: {
            mapId: '@',
            serviceUrl: '<',
            filter: '<',
            mapLayers: '<',
            geometrySelected: '&onGeometrySelected'
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

                this.$onInit = () => {
                    initMap();
                };

                this.$onChanges = () => {
                    initMap(() => {
                        this.loading = true;
                        leafletData.getMap(this.mapId).then((map) => {
                            // clear layer
                            if (layer) map.removeLayer(layer);
                            // add geometries to layer
                            seriesApiInterface.getDatasets(null, this.serviceUrl, this.filter)
                                .then((dataset) => {
                                    if (dataset instanceof Array) {
                                        var timespan = {
                                            start: dataset[0].firstValue.timestamp,
                                            end: dataset[0].lastValue.timestamp
                                        };
                                        seriesApiInterface.getDatasetData(dataset[0].id, this.serviceUrl, timespan)
                                            .then(data => {
                                                if (data.values instanceof Array) {
                                                    layer = L.markerClusterGroup({
                                                        animate: false
                                                    });
                                                    data.values.forEach(entry => {
                                                        var geojson = L.geoJson(entry.geometry);
                                                        geojson.setStyle(defaultStyle);
                                                        geojson.addTo(map);
                                                        geojson.on('click', () => {
                                                            this.geometrySelected({
                                                                dataset: dataset[0],
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
                                                        layer.addLayer(geojson);
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
                };
            }
        ]
    });
