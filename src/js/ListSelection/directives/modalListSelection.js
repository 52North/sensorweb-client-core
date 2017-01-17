angular.module('n52.core.listSelection')
        .directive('swcModalListSelection', [
            function () {
                return {
                    restrict: 'E',
                    templateUrl: 'n52.core.listSelection.list-selection',
                    scope: {
                        parameters: '=',
                        listselectionid: '='
                    },
                    controller: 'SwcModalListSelectionCtrl'
                };
            }]);
