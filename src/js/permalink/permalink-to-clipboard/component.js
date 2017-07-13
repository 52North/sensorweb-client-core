require('../permalink');

angular.module('n52.core.permalink')
    .component('swcPermalinkToClipboard', {
        bindings: {
            url: '<',
            onTriggered: '&'
        },
        templateUrl: 'n52.core.permalink.to-clipboard',
        controller: ['$window', '$translate',
            function($window, $translate) {
                this.toClipboard = () => {
                    $window.prompt($translate.instant('settings.permalink.clipboardInfo'), this.url);
                    this.onTriggered();
                };
            }
        ]
    });
