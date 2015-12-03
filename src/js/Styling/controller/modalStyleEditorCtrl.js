angular.module('n52.core.style')
        .controller('SwcModalStyleEditorCtrl', ['$scope', 'timeseries', '$uibModalInstance',
            function ($scope, timeseries, $uibModalInstance) {
                $scope.timeseries = timeseries;
                $scope.modalInstance = $uibModalInstance;
                $scope.close = function () {
                    $uibModalInstance.close();
                };
            }]);