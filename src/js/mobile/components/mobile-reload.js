angular.module('n52.core.mobile')
    .component('swcMobileReload', {
        templateUrl: 'n52.core.mobile.reload',
        bindings: {
            datasetId: '<',
            providerUrl: '<'
        },
        controller: ['mobileReloadSrvc',
            function(mobileReloadSrvc) {
                this.$onChanges = function() {
                    mobileReloadSrvc.stopReload();
                };
                this.toggled = false;
                this.toggleReload = function() {
                    this.toggled = !this.toggled;
                    if (this.toggled) {
                        mobileReloadSrvc.startReload(this.datasetId, this.providerUrl);
                    } else {
                        mobileReloadSrvc.stopReload();
                    }
                };
            }
        ]
    })
    .service('mobileReloadSrvc', ['combinedSrvc',
        function(combinedSrvc) {
            this.reload = false;

            this.startReload = function(id, url) {
                this.reload = true;
                this.reloadData(id, url);
            };

            this.stopReload = function() {
                this.reload = false;
            };

            this.reloadData = function(id, url) {
                if (this.reload) {
                    combinedSrvc.loadSeries(id, url).then(() => {
                        setTimeout(() => {
                            this.reloadData(id, url);
                        }, 2000);
                    });
                }
            };
        }
    ]);
