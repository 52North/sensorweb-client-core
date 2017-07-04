angular.module('n52.core.map')
    .component('swcSearchControl', {
        bindings: {
            mapId: '@'
        },
        templateUrl: 'n52.core.map.search-control',
        controller: ['locateService', 'nominatimService', 'leafletData',
            function(locateService, nominatimService, leafletData) {
                this.startSearch = (term) => {
                    if (angular.isDefined(term) && angular.isString(term)) {
                        nominatimService.query(term, this.mapId).then((data) => {
                            leafletData.getMap(this.mapId).then(map => {
                                map.panTo(L.latLng(data.lat, data.lon));
                                // mapService.map.markers.searchResult = {
                                //     lat: parseFloat(data.lat),
                                //     lng: parseFloat(data.lon),
                                //     icon: settingsService.searchResultIconOptions ? settingsService.searchResultIconOptions : {}
                                // };
                            });
                        });
                    }
                };
            }
        ]
    });
