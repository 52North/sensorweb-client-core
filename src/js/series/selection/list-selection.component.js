require('../series');
angular.module('n52.core.series')
    .component('swcListSelector', {
        bindings: {
            parameters: '<',
            providerList: '<',
            selectorId: '@',
            datasetSelection: '&onDatasetSelection'
        },
        templateUrl: 'n52.core.series.list-selection',
        controller: ['seriesApiMappingService', 'seriesApiInterface', 'swcListSelectorSrvc',
            function(seriesApiMappingService, seriesApiInterface, swcListSelectorSrvc) {

                var openDataset = (url, params) => {
                    seriesApiMappingService.getApiVersion(url).then(
                        (apiVersionId) => {
                            if (apiVersionId === seriesApiMappingService.apiVersion.n52SeriesApiV2) {
                                seriesApiInterface.getDatasets(null, url, params).then(result => {
                                    this.datasetSelection({
                                        dataset: result,
                                        url: url
                                    });
                                });
                            } else if (apiVersionId === seriesApiMappingService.apiVersion.n52SeriesApiV1) {
                                seriesApiInterface.getTimeseries(null, url, params).then(result => {
                                    this.datasetSelection({
                                        dataset: result,
                                        url: url
                                    });
                                });
                            }
                        }
                    );
                };

                this.$onInit = () => {
                    if (this.selectorId && swcListSelectorSrvc[this.selectorId]) {
                        this.parameters = swcListSelectorSrvc[this.selectorId];
                    } else {
                        if (this.selectorId) {
                            swcListSelectorSrvc[this.selectorId] = this.parameters;
                        }
                        // create filterlist for first parameter entry
                        this.parameters[0].filterList = this.providerList;
                        // open first tab
                        this.parameters[0].isOpen = true;
                        // disable parameterList
                        for (var i = 1; i < this.parameters.length; i++) {
                            this.parameters[i].isDisabled = true;
                        }
                    }
                };

                this.itemSelected = (item, index) => {
                    // set selection
                    if (index < this.parameters.length - 1) {
                        this.parameters[index].headerAddition = item.label;
                        this.parameters[index].isOpen = false;

                        this.parameters[index + 1].isDisabled = false;
                        this.parameters[index + 1].filterList = item.filterList.map((entry) => {
                            entry.filter[this.parameters[index].type] = entry.itemId;
                            return angular.copy(entry);
                        });
                        this.parameters[index + 1].isOpen = true;
                        for (var i = index + 2; i < this.parameters.length; i++) {
                            this.parameters[i].isDisabled = true;
                        }
                        for (var j = index + 1; j < this.parameters.length; j++) {
                            this.parameters[j].headerAddition = '';
                        }
                    } else {
                        item.filterList.forEach((entry) => {
                            entry.filter[this.parameters[index].type] = entry.itemId;
                            openDataset(entry.url, entry.filter);
                        });
                    }
                };
            }
        ]
    })
    .service('swcListSelectorSrvc', [
        function() {}
    ]);
