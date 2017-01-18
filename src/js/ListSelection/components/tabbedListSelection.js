angular.module('n52.core.listSelection')
    .component('swcTabbedListSelection', {
        bindings: {
            onSelectionFinished: '&'
        },
        templateUrl: 'n52.core.listSelection.tabbed-list-selection',
        controller: ['timeseriesService', 'serviceFinder', '$location',
            function(timeseriesService, serviceFinder, $location) {
                this.datasetSelected = function(dataset) {
                    // TODO iterate over results
                    if (dataset[0].datasetType) {
                        serviceFinder.getDatasetPresenter(dataset[0].datasetType, dataset[0].seriesParameters.platform.platformType, url).presentDataset(dataset[0], url);
                    } else {
                        timeseriesService.addTimeseries(dataset[0]);
                        $location.url('/diagram');
                    }
                    this.onSelectionFinished();
                };
            }
        ]
    });
