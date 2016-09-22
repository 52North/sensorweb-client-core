angular.module('n52.core.map')
    .directive('swcModalStationOpener', [
        function() {
            return {
                restrict: 'E',
                scope: {
                    mapid: '=',
                    controller: '=',
                    stationaryremotectrl: '='
                },
                controller: ['$scope', '$rootScope', 'modalStationOpenSrvc',
                    function($scope, $rootScope, modalStationOpenSrvc) {
                        clickmarker = function(event, args) {
                            var station = {};
                            if (args.model) {
                                station.id = args.model.stationsId ? args.model.stationsId : "";
                                station.url = args.model.url ? args.model.url : "";
                            } else if (args.leafletObject && args.leafletObject.options) {
                                station.id = args.leafletObject.options.stationsId ? args.leafletObject.options.stationsId : "";
                                station.url = args.leafletObject.options.url ? args.leafletObject.options.url : "";
                            }
                            switch (args.model.platformType) {
                                case 'stationary_remote':
                                    station.ctrl = $scope.stationaryremotectrl;
                                    modalStationOpenSrvc.openStationRemotePlatform(station);
                                    break;
                                    //case 'stationary_insitu':
                                default:
                                    station.ctrl = $scope.controller;
                                    modalStationOpenSrvc.openStation(station);
                            }
                        };
                        var mapId = $scope.mapid;
                        var pathClickListener = $rootScope.$on('leafletDirectivePath.' + mapId + '.click', clickmarker);
                        var markerClickListener = $rootScope.$on('leafletDirectiveMarker.' + mapId + '.click', clickmarker);
                        $scope.$on('$destroy', function() {
                            pathClickListener();
                            markerClickListener();
                        });
                    }
                ]
            };
        }
    ])
    .service('modalStationOpenSrvc', ['$uibModal', 'mapService',
        function($uibModal, mapService) {
            this.openStation = function(station) {
                $uibModal.open({
                    animation: true,
                    templateUrl: 'templates/map/station.html',
                    resolve: {
                        selection: function() {
                            var url = station.url;
                            var phenomenonId;
                            if (mapService.map.selectedPhenomenon) {
                                angular.forEach(mapService.map.selectedPhenomenon.provider, function(provider) {
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
            };

            this.openStationRemotePlatform = function(platform) {
                $uibModal.open({
                    animation: true,
                    templateUrl: 'templates/map/stationary-remote-platform.html',
                    resolve: {
                        selection: function() {
                            var url = platform.url;
                            var phenomenonId;
                            if (mapService.map.selectedPhenomenon) {
                                angular.forEach(mapService.map.selectedPhenomenon.provider, function(provider) {
                                    if (url === provider.url)
                                        phenomenonId = provider.phenomenonID;
                                });
                            }
                            return {
                                id: platform.id,
                                phenomenonId: phenomenonId,
                                url: url
                            };
                        }
                    },
                    controller: platform.ctrl
                });
            };
        }
    ]);
