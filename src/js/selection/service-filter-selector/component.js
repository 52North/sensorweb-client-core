require('../selection');

angular.module('n52.core.selection')
    .component('swcServiceFilterSelector', {
        bindings: {
            endpoint: '<',
            serviceUrl: '<',
            filter: '<',
            selectionId: '<',
            itemSelected: "&onItemSelected",
        },
        templateUrl: 'n52.core.selection.service-filter-selector',
        controller: ['seriesApiInterface',
            function(seriesApiInterface) {
                this.items = [];

                var setItems = (res) => {
                    if (res instanceof Array) {
                        this.items = res;
                    } else {
                        this.items = [];
                    }
                    this.loading = false;
                };

                var setFailed = () => {
                    this.loading = false;
                };

                this.$onChanges = () => {
                    this.loading = true;
                    switch (this.endpoint) {
                        case 'offering':
                            seriesApiInterface.getOfferings(null, this.serviceUrl, this.filter)
                                .then(res => setItems(res))
                                .catch(error => setFailed(error));
                            break;
                        case 'phenomenon':
                            seriesApiInterface.getPhenomena(null, this.serviceUrl, this.filter)
                                .then(res => setItems(res))
                                .catch(error => setFailed(error));
                            break;
                        case 'procedure':
                            seriesApiInterface.getProcedures(null, this.serviceUrl, this.filter)
                                .then(res => setItems(res))
                                .catch(error => setFailed(error));
                            break;
                        case 'category':
                            seriesApiInterface.getCategories(null, this.serviceUrl, this.filter)
                                .then(res => setItems(res))
                                .catch(error => setFailed(error));
                            break;
                        case 'feature':
                            seriesApiInterface.getFeatures(null, this.serviceUrl, this.filter)
                                .then(res => setItems(res))
                                .catch(error => setFailed(error));
                            break;
                        default:
                            console.error('Wrong endpoint: ' + this.endpoint);
                    }
                };

                this.selectItem = (item) => {
                    this.itemSelected({
                        item: item
                    });
                };
            }
        ]
    });
