require('../permalink');

angular.module('n52.core.permalink')
    .component('swcSimplePermalinkButton', {
        bindings: {
            generatedUrlFunction: '<'
        },
        templateUrl: 'n52.core.permalink.button',
        controller: ['profileChartPermalinkSrvc', 'permalinkOpener',
            function(profileChartPermalinkSrvc, permalinkOpener) {
                this.permalink = () => {
                    var generatedUrl = this.generatedUrlFunction();
                    permalinkOpener.openPermalink(generatedUrl);
                };
            }
        ]
    })
    .service('permalinkOpener', ['$window', '$translate',
        function($window, $translate) {
            this.openPermalink = (url) => {
                $window.prompt($translate.instant('settings.permalink.clipboardInfo'), url);
            };
        }
    ]);
