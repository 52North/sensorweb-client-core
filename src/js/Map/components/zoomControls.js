angular.module('n52.core.map')
    .component('swcZoomControls', {
        bindings: {
            mapId: '@'
        },
        templateUrl: 'n52.core.map.zoom-controls',
        controller: ['seriesApiInterface', 'leafletData',
            function(seriesApiInterface, leafletData) {
                this.zoomIn = () => {
                    leafletData.getMap(this.mapId).then(map => map.zoomIn());
                };

                this.zoomOut = () => {
                    leafletData.getMap(this.mapId).then(map => map.zoomOut());
                };
            }
        ]
    });
