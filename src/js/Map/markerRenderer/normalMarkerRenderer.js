angular.module('n52.core.map')
        .factory('normalMarkerRenderer', ['statusService', 'settingsService', 'markerRendererHelper',
            function (statusService, settingsService, markerRendererHelper) {

                var stationMarkerIcon = settingsService.stationIconOptions ? settingsService.stationIconOptions : {};

                var addMarker = function (params) {
                    var marker = {
                        lat: params.geometry[1],
                        lng: params.geometry[0],
                        icon: stationMarkerIcon,
                        stationsId: params.element.station ? params.element.station.properties.id : params.element.properties.id,
                        url: params.serviceUrl
                    };
                    if (statusService.status.clusterStations) {
                        marker.layer = 'cluster';
                    }
                    params.map.markers[markerRendererHelper.getStationId()] = marker;
                    return true;
                };

                return {
                    addMarker: addMarker
                };
            }]);