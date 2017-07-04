angular.module('n52.core.listSelection')
    .component('swcTabbedListSelection', {
        bindings: {
            onSelectionFinished: '&',
            providerList: '<'
        },
        templateUrl: 'n52.core.listSelection.tabbed-list-selection',
        controller: ['timeseriesService', 'serviceFinder', '$location', 'providerService',
            function(timeseriesService, serviceFinder, $location, providerService) {

                this.$onInit = () => {
                    if (!(this.providerList instanceof Array)) {
                        this.providerList = providerService.selectedProviderList;
                    }
                };

                this.datasetSelected = function(dataset, url) {
                    // TODO iterate over results
                    // if (dataset[0].datasetType || dataset[0].valueType) {
                    //     seriesApiInterface.getDatasets(dataset[0].id, url).then(result => {
                    //         serviceFinder.getDatasetPresenter(result.datasetType || result.valueType, result.seriesParameters.platform.platformType, url).presentDataset(result, url);
                    //     });
                    // } else {
                    //     timeseriesService.addTimeseries(dataset[0]);
                    //     $location.url('/diagram');
                    // }
                    this.onSelectionFinished({
                        dataset,
                        url
                    });
                };
            }
        ]
    });
