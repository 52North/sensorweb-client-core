angular.module('n52.core.mobile')
    .component('swcMobilePermalink', {
        templateUrl: 'n52.core.mobile.permalink',
        bindings: {
            datasetId: '<',
            providerUrl: '<'
        },
        controller: ['permalinkGenerationService', '$window', '$translate',
            function(permalinkGenerationService, $window, $translate) {
                var ctrl = this;
                ctrl.createPermalink = function() {
                    var link = permalinkGenerationService.createPermalink('/mobileDiagram', {
                        datasetId: ctrl.datasetId,
                        providerUrl: ctrl.providerUrl
                    });
                    $window.prompt($translate.instant('settings.permalink.clipboardInfo'), link);
                };
            }
        ]
    });
