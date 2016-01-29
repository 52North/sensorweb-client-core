angular.module('n52.core.listSelection')
        .directive('swcModalListSelection', [
            function () {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/listSelection/list-selection.html',
                    scope: {
                        parameters: '=',
                        listselectionid: '='
                    },
                    controller: 'SwcModalListSelectionCtrl'
                };
            }]);