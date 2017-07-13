require('../permalink');

angular.module('n52.core.permalink')
    .component('swcPermalinkNewWindow', {
        bindings: {
            url: '<',
            onTriggered: '&'
        },
        templateUrl: 'n52.core.permalink.new-window',
        controller: ['$window',
            function($window) {
                this.openInNewWindow = () => {
                    $window.open(this.url, '_blank');
                    this.onTriggered();
                };
            }
        ]
    });
