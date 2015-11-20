angular.module('n52.core.listSelection')
        .controller('SwcListSelectionButtonCtrl', ['$scope', '$modal',
            function ($scope, $modal) {
                $scope.openListSelection = function () {
                    $modal.open({
                        animation: true,
                        templateUrl: 'templates/listSelection/modal-list-selection.html',
                        controller: 'SwcModalListSelectionCtrl'
                    });
                };
            }]);
