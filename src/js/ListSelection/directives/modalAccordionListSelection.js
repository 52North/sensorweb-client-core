angular.module('n52.core.listSelection')
        .directive('swcModalAccordionListSelection', [
            function () {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/listSelection/accordion-modal-list-selection.html',
                    scope: {
                        parameters: '='
                    },
                    controller: 'SwcModalAccordionListSelectionCtrl'
                };
            }]);