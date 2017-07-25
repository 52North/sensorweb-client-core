require('../legendModule');

angular.module('n52.core.legend')
    .component('swcGeometryMapViewer', {
        bindings: {
            mapId: '@',
            highlight: '<',
            geometry: '<',
            maxMapZoom: '<'
        },
        templateUrl: 'n52.core.legend.geometry-map-viewer',
        controller: [
            function() {

                var defaultStyle = {
                    color: 'red',
                    weight: 5,
                    opacity: 0.65
                };

                var highlightStyle = {
                    color: 'blue',
                    weight: 10,
                    opacity: 1
                };

                var highlightGeoJson, map;

                this.$onInit = () => {

                    setTimeout(() => {
                        map = L.map(this.mapId, {
                            maxZoom: this.maxMapZoom || 10
                        });

                        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        }).addTo(map);

                        var geojson = L.geoJson(this.geometry, {
                            pointToLayer: (feature, latlng) => {
                                return L.circleMarker(latlng, defaultStyle);
                            }
                        });
                        geojson.setStyle(defaultStyle);
                        geojson.addTo(map);

                        map.fitBounds(geojson.getBounds());
                        map.invalidateSize();

                    }, 100);
                };

                this.$onChanges = (changes) => {
                    if (changes.highlight.currentValue) {
                        if (highlightGeoJson) {
                            map.removeLayer(highlightGeoJson);
                        }
                        highlightGeoJson = L.geoJson(this.highlight, {
                            pointToLayer: (feature, latlng) => {
                                return L.circleMarker(latlng, highlightStyle);
                            }
                        });
                        highlightGeoJson.setStyle(highlightGeoJson);
                        highlightGeoJson.addTo(map);
                    }
                };
            }
        ]
    });
