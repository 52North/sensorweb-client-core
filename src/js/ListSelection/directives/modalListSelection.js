angular.module('n52.core.listSelection')
        .directive('swcModalListSelection', [
            function () {
                debugger;
                return {
                    restrict: 'E',
                    templateUrl: 'templates/listSelection/list-selection.html',
                    scope: {
                        parameters: '='
                    },
                    controller: 'SwcModalListSelectionCtrl'
                };
            }]);