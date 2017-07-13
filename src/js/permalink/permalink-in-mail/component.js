require('../permalink');

angular.module('n52.core.permalink')
    .component('swcPermalinkInMail', {
        bindings: {
            url: '<',
            onTriggered: '&'
        },
        templateUrl: 'n52.core.permalink.in-mail',
        controller: ['$window',
            function($window) {
                this.openInMail = () => {
                    $window.location = 'mailto:?body=' + encodeURIComponent(this.url);
                    this.onTriggered();
                };
            }
        ]
    });
