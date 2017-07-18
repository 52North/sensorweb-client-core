require('../legendModule');

angular.module('n52.core.legend')
    .component('swcGeometryMapViewer', {
        bindings: {
            mapId: '@',
            geometry: '<'
        },
        templateUrl: 'n52.core.legend.geometry-map-viewer',
        controller: [
            function() {

                var defaultStyle = {
                    color: 'red',
                    weight: 5,
                    opacity: 0.65
                };

                this.markers = {};
                var layer;

                this.$onInit = () => {

                    setTimeout(() => {
                        var map = L.map(this.mapId, {
                            maxZoom: 10
                        });

                        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        }).addTo(map);

                        var geojson = L.geoJson(this.geometry, {
                            pointToLayer: function(feature, latlng) {
                                return L.circleMarker(latlng, defaultStyle);
                            }
                        });
                        geojson.setStyle(defaultStyle);
                        geojson.addTo(map);

                        map.fitBounds(geojson.getBounds());
                        map.invalidateSize();

                    }, 100);
                };
            }
        ]
    });
