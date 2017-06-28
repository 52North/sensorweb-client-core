require('../selection');
angular.module('n52.core.selection')
    .component('platformMapSelector', {
        bindings: {
            mapId: '@',
            serviceUrl: '<',
            filter: '<',
            mapLayers: '<',
            cluster: '<',
            platformSelected: "&onPlatformSelected",
        },
        templateUrl: 'n52.core.selection.platform-map-selector',
        controller: ['seriesApiInterface', '$scope', 'leafletData',
            function(seriesApiInterface, $scope, leafletData) {

                this.markers = {};
                var layer;

                this.$onInit = () => {
                    setTimeout(() => {
                        leafletData.getMap(this.mapId).then((map) => {
                            map.invalidateSize();
                        });
                    }, 10);
                };

                this.$onChanges = () => {
                    this.loading = true;
                    leafletData.getMap(this.mapId).then((map) => {
                        // clear layer
                        if (layer) map.removeLayer(layer);
                        // add marker to layer
                        seriesApiInterface.getPlatforms(null, this.serviceUrl, this.filter)
                            .then((res) => {
                                layer = L.markerClusterGroup();
                                res.forEach(entry => {
                                    var marker = L.marker([entry.geometry.coordinates[1], entry.geometry.coordinates[0]], {

                                    });
                                    marker.on('click', () => {
                                        seriesApiInterface.getPlatforms(entry.id, this.serviceUrl)
                                            .then(entry => {
                                                this.platformSelected({
                                                    platform: entry
                                                });
                                            });
                                    });
                                    marker.addTo(map);
                                    layer.addLayer(marker);
                                });

                                layer.addTo(map);
                                // zoom to layer
                                map.invalidateSize();
                                map.fitBounds(layer.getBounds());
                                this.loading = false;
                            });
                    });
                };
            }
        ]
    });
