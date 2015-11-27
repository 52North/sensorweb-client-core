angular.module('n52.core.style')
        .controller('SwcModalStyleEditorCtrl', ['$scope', 'timeseries', '$modalInstance',
            function ($scope, timeseries, $modalInstance) {
                $scope.timeseries = timeseries;
                $scope.modalInstance = $modalInstance;
                $scope.close = function () {
                    $modalInstance.close();
                };
            }]);