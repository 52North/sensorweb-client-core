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
                controller: ['$scope', '$rootScope', 'modalStationOpenSrvc', 'serviceFinder',
                    function($scope, $rootScope, modalStationOpenSrvc, serviceFinder) {
                        var clickmarker = function(event, args) {
                            var platform = {};
                            if (args.model) {
                                platform.id = args.model.stationsId ? args.model.stationsId : '';
                                platform.url = args.model.url ? args.model.url : '';
                            } else if (args.leafletObject && args.leafletObject.options) {
                                platform.id = args.leafletObject.options.stationsId ? args.leafletObject.options.stationsId : '';
                                platform.url = args.leafletObject.options.url ? args.leafletObject.options.url : '';
                            }
                            var platformPresenter = serviceFinder.getPlatformPresenter(args.model.platformType, platform.url);
                            if (platformPresenter) {
                                platformPresenter.presentPlatform(platform);
                            } else {
                                modalStationOpenSrvc.presentPlatform(platform, $scope.controller);
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
            this.presentPlatform = function(station, ctrl) {
                $uibModal.open({
                    animation: true,
                    templateUrl: 'n52.core.map.station',
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
                    controller: ctrl || 'SwcModalStationCtrl'
                });
            };
        }
    ]);
