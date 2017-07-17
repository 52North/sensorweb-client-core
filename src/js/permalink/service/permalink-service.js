require('../permalink');

angular.module('n52.core.permalink')
    .service('permalinkService', [ '$location',
        function($location) {
            this.createBaseUrl = () => {
                if ($location.absUrl().indexOf('?') !== -1) {
                    return $location.absUrl().substring(0, $location.absUrl().indexOf('?'));
                } else {
                    return $location.absUrl();
                }
            };
        }
    ]);
