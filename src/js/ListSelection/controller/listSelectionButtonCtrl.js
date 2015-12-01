angular.module('n52.core.listSelection')
        .controller('SwcListSelectionButtonCtrl', ['$scope', 'modalOpener',
            function ($scope, modalOpener) {
                $scope.openListSelection = function () {
                    modalOpener.open({
                        templateUrl: 'templates/listSelection/modal-list-selection.html'
                    });
                };
            }]);
