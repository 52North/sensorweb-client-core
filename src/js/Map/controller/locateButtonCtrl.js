angular.module('n52.core.locate')
    .directive('swcLocateUser', ['locateService',
        function(locateService) {
            return {
                restrict: 'A',
                link: function(scope, elem, attr) {
                    var mapId = attr.swcLocateUser;
                    scope.locateUser = function() {
                        scope.isToggled = !scope.isToggled;
                        locateService.locateUser(mapId, scope.isToggled);
                    };
                    scope.$on('$destroy', function() {
                        locateService.locateUser(mapId, false);
                    });
                }
            };
        }
    ]);
