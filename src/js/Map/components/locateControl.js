angular.module('n52.core.locate', [])
    .component('swcLocateControl', {
        bindings: {
            mapId: '@'
        },
        templateUrl: 'n52.core.map.locate-control',
        controller: ['locateService',
            function(locateService) {
                this.locateUser = () => {
                    this.isToggled = !this.isToggled;
                    locateService.locateUser(this.mapId, this.isToggled);
                };

                this.$onDestroy = () => {
                    locateService.locateUser(this.mapId, false);
                };
            }
        ]
    })
    .factory('locateService', ['leafletData', 'settingsService',
        function(leafletData, settingsService) {
            var marker,
                locateIcon = settingsService.locateIconOptions ? L.icon(settingsService.locateIconOptions) : new L.Icon.Default();
            var locateUser = function(mapId, search) {
                leafletData.getMap(mapId).then(function(map) {
                    if (search) {
                        map.on('locationfound', function(evt) {
                            removeMarker(map);
                            marker = L.marker(evt.latlng, {
                                icon: locateIcon
                            }).addTo(map);
                        });
                        map.locate({
                            watch: true,
                            setView: true
                            //                                maxZoom: map.getZoom()
                        });
                    } else {
                        map.stopLocate();
                        removeMarker(map);
                    }
                });
            };
            var removeMarker = function(map) {
                if (angular.isDefined(marker)) {
                    map.removeLayer(marker);
                }
            };
            return {
                locateUser: locateUser
            };
        }
    ]);
