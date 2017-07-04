require('../selection');

angular.module('n52.core.selection')
    .component('swcPlatformMapSelector', {
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

                var myIcon = L.icon({
                    iconUrl: require('leaflet/dist/images/marker-icon.png'),
                    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
                    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });

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
                                layer = L.markerClusterGroup({
                                    animate: false
                                });
                                res.forEach(entry => {
                                    var marker = L.marker([entry.geometry.coordinates[1], entry.geometry.coordinates[0]], {
                                        icon: myIcon
                                    });
                                    marker.on('click', () => {
                                        seriesApiInterface.getPlatforms(entry.id, this.serviceUrl)
                                            .then(entry => {
                                                this.platformSelected({
                                                    platform: entry
                                                });
                                            });
                                    });
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
