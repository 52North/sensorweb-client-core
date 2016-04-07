angular.module('n52.core.map')
        .factory('markerRendererHelper', [
            function () {
                var stationIdx = 0;

                var getStationId = function () {
                    return stationIdx++;
                };
                
                return {
                    getStationId: getStationId
                };
            }]);