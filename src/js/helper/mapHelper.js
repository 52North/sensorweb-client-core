angular.module('n52.core.helper', [])
        .factory('mapHelper', [
            function () {
                adjustBounds = function (latlng, bounds) {
                    if (angular.isUndefined(bounds)) {
                        bounds = {
                            southWest: {
                                lat: latlng.lat,
                                lng: latlng.lng
                            },
                            northEast: {
                                lat: latlng.lat,
                                lng: latlng.lng
                            }
                        };
                    } else {
                        if (bounds.southWest.lat > latlng.lat) {
                            bounds.southWest.lat = latlng.lat;
                        }
                        if (bounds.southWest.lng > latlng.lng) {
                            bounds.southWest.lng = latlng.lng;
                        }
                        if (bounds.northEast.lat < latlng.lat) {
                            bounds.northEast.lat = latlng.lat;
                        }
                        if (bounds.northEast.lng < latlng.lng) {
                            bounds.northEast.lng = latlng.lng;
                        }
                    }
                    return bounds;
                };
                createBounds = function (latlngs) {
                    var bounds;
                    angular.forEach(latlngs, function (latlng) {
                        bounds = adjustBounds(latlng, bounds);
                    });
                    return bounds;
                };
                
                return {
                    createBounds: createBounds
                };
            }]);