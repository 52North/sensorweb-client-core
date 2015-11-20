angular.module('n52.core.listSelection')
        .directive('swcListSelection', [function () {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/listSelection/accordion-list-selection.html',
                    scope: {
                        parameters: '='
                    },
                    controller: 'SwcListSelectionCtrl'
                };
            }]);
