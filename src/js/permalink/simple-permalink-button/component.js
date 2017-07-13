require('../permalink');
require('../permalink-modal-opener/service');

angular.module('n52.core.permalink')
    .component('swcSimplePermalinkButton', {
        bindings: {
            generatedUrlFunction: '<'
        },
        templateUrl: 'n52.core.permalink.button',
        controller: ['permalinkOpener',
            function(permalinkOpener) {
                this.permalink = () => {
                    var generatedUrl = this.generatedUrlFunction();
                    permalinkOpener.openPermalink(generatedUrl);
                };
            }
        ]
    });
