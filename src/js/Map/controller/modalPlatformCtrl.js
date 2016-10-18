angular.module('n52.core.map')
    .controller('SwcModalStationaryInsituCtrl', ['$scope', '$uibModalInstance', 'timeseriesService', '$location', 'stationService', 'selection', 'interfaceService', 'serviceFinder',
        function($scope, $uibModalInstance, timeseriesService, $location, stationService, selection, interfaceService, serviceFinder) {

            interfaceService.getPlatforms(selection.stationId, selection.url)
                .then(platform => {
                    $scope.platform = platform;
                    $scope.platform.datasets.forEach(entry => {
                        interfaceService.getDatasets(entry.id, selection.url)
                            .then(dataset => {
                                dataset.selected = true;
                                angular.extend(entry, dataset);
                            });
                    });
                });

            $scope.isAllSelected = !stationService.preselectFirstTimeseries;

            $scope.toggleAll = function() {
                angular.forEach($scope.platform.datasets, function(dataset) {
                    dataset.selected = $scope.isAllSelected;
                });
            };

            $scope.close = function() {
                $uibModalInstance.close();
            };

            $scope.toggled = function() {
                var allSelected = true;
                angular.forEach($scope.platform.datasets, function(dataset) {
                    if (!dataset.selected)
                        allSelected = false;
                });
                $scope.isAllSelected = allSelected;
            };

            $scope.presentSelection = function() {
                angular.forEach($scope.platform.datasets, function(dataset) {
                    if (dataset.selected && (!selection.phenomenonId || dataset.seriesParameters.phenomenon.id === selection.phenomenonId)) {
                        serviceFinder
                            .getDatasetPresenter(dataset.datasetType, dataset.seriesParameters.platform.platformType, selection.url)
                            .presentDataset(dataset, selection.url);
                    }
                });
                $uibModalInstance.close();
            };
        }
    ])
    .service('modalStationaryInsituOpenSrvc', ['$uibModal', 'mapService',
        function($uibModal, mapService) {
            this.presentPlatform = function(station) {
                $uibModal.open({
                    animation: true,
                    templateUrl: 'templates/map/stationary_insitu.html',
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
                    controller: 'SwcModalStationaryInsituCtrl'
                });
            };
        }
    ]);
