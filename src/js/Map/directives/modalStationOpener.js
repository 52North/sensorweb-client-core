angular.module('n52.core.map')
        .directive('swcModalStationOpener', [
            function () {
                return {
                    restrict: 'E',
                    scope: {
                        mapid: '=',
                        controller: '='
                    },
                    controller: ['$scope', '$uibModal', '$rootScope', 'mapService',
                        function ($scope, $uibModal, $rootScope, mapService) {
                            clickmarker = function (event, args) {
                                $uibModal.open({
                                    animation: true,
                                    templateUrl: 'templates/map/station.html',
                                    resolve: {
                                        selection: function () {
                                            var stationsId;
                                            var url;
                                            if (args.model) {
                                                stationsId = args.model.stationsId ? args.model.stationsId : "";
                                                url = args.model.url ? args.model.url : "";
                                            } else if (args.leafletObject && args.leafletObject.options) {
                                                stationsId = args.leafletObject.options.stationsId ? args.leafletObject.options.stationsId : "";
                                                url = args.leafletObject.options.url ? args.leafletObject.options.url : "";
                                            }
                                            return {
                                                stationId: stationsId,
                                                phenomenonId: mapService.map.selectedPhenomenonId,
                                                url: url
                                            };
                                        }
                                    },
                                    controller: $scope.controller
                                });
                            };
                            var mapId = $scope.mapid;
                            var pathClickListener = $rootScope.$on('leafletDirectivePath.' + mapId + '.click', clickmarker);
                            var markerClickListener = $rootScope.$on('leafletDirectiveMarker.' + mapId + '.click', clickmarker);
                            $scope.$on('$destroy', function () {
                                pathClickListener();
                                markerClickListener();
                            });
                        }]
                };
            }]);