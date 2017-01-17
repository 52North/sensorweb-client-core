angular.module('n52.core.userSettings')
        .directive('swcSettingsToggleButton', ['statusService',
            function (statusService) {
                return {
                    restrict: 'E',
                    templateUrl: 'n52.core.userSettings.settings-toggle-button',
                    scope: {},
                    link: function (scope, element, attrs) {
                        scope.status = statusService.status;
                        scope.field = attrs.field;
                        scope.caption = attrs.caption;
                        scope.description = attrs.description;
                        scope.toggle = function () {
                            statusService.status[attrs.field] = !statusService.status[attrs.field];
                        };
                    }
                };
            }]);
