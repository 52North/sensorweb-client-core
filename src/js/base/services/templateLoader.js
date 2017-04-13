angular.module('n52.core.base')
    .service('templatesLoader', ['templatesMapping',
        function(templatesMapping) {
            this.getTemplateForId = function(id) {
                if (templatesMapping && templatesMapping.hasOwnProperty(id)) {
                    return templatesMapping[id];
                }
                return id;
            };
        }
    ])
    .config(['$provide',
        function($provide) {
            $provide.decorator('$templateRequest', ['$delegate', 'templatesLoader',
                function($delegate, templatesLoader) {
                    templatesLoader.oldRequest = $delegate;
                    $delegate = function(id, ignoreRequestError) {
                        return templatesLoader.oldRequest(templatesLoader.getTemplateForId(id), ignoreRequestError);
                    };
                    return $delegate;
                }
            ]);
        }
    ]);
