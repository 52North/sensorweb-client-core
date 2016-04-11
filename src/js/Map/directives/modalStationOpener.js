angular.module('n52.core.map')
        .directive('swcModalStationOpener', [
            function () {
                return {
                    restrict: 'E',
                    scope: {
                        mapid: '=',
                        controller: '='
                    },
                    controller: ['$scope', '$rootScope', 'modalStationOpenSrvc',
                        function ($scope, $rootScope, modalStationOpenSrvc) {
                            clickmarker = function (event, args) {
                                var station = {
                                    ctrl : $scope.controller
                                };
                                if (args.model) {
                                    station.id = args.model.stationsId ? args.model.stationsId : "";
                                    station.url = args.model.url ? args.model.url : "";
                                } else if (args.leafletObject && args.leafletObject.options) {
                                    station.id = args.leafletObject.options.stationsId ? args.leafletObject.options.stationsId : "";
                                    station.url = args.leafletObject.options.url ? args.leafletObject.options.url : "";
                                }
                                modalStationOpenSrvc.openStation(station);
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
            }])
        .factory('modalStationOpenSrvc', ['$uibModal','mapService',
            function ($uibModal, mapService) {
                function openStation(station) {
                    $uibModal.open({
                        animation: true,
                        templateUrl: 'templates/map/station.html',
                        resolve: {
                            selection: function () {
                                var url = station.url;
                                var phenomenonId;
                                if (mapService.map.selectedPhenomenon) {
                                    angular.forEach(mapService.map.selectedPhenomenon.provider, function (provider) {
                                        if (url === provider.url)
                                            phenomenonId = provider.phenomenonID;
                                    });
                                }
                                return {
                                    stationId: station.id,
                                    phenomenonId: phenomenonId,
                                    url: url
                                };
                            }
                        },
                        controller: station.ctrl || 'SwcModalStationCtrl'
                    });
                }
                return {
                    openStation: openStation
                };
            }]);