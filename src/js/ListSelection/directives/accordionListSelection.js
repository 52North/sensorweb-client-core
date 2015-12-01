angular.module('n52.core.listSelection')
        .directive('swcAccordionListSelection', [
            function () {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/listSelection/accordion-list-selection.html',
                    scope: {
                        parameters: '='
                    },
                    controller: 'SwcAccordionListSelectionCtrl'
                };
            }]);