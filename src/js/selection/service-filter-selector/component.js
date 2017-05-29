require('../selection');
angular.module('n52.core.selection')
    .component('serviceFilterSelector', {
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

                this.$onChanges = () => {
                    switch (this.endpoint) {
                        case 'offering':
                            seriesApiInterface.getOfferings(null, this.serviceUrl, this.filter)
                                .then(res => this.items = res);
                            break;
                        case 'phenomenon':
                            seriesApiInterface.getPhenomena(null, this.serviceUrl, this.filter)
                                .then(res => this.items = res);
                            break;
                        case 'procedure':
                            seriesApiInterface.getProcedures(null, this.serviceUrl, this.filter)
                                .then(res => this.items = res);
                            break;
                        case 'category':
                            seriesApiInterface.getCategories(null, this.serviceUrl, this.filter)
                                .then(res => this.items = res);
                            break;
                        case 'feature':
                            seriesApiInterface.getFeatures(null, this.serviceUrl, this.filter)
                                .then(res => this.items = res);
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
