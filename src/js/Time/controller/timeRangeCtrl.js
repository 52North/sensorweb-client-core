angular.module('n52.core.timeRange')
        .controller('SwcTimeRangeCtrl', ['$scope', '$modal',
            function ($scope, $modal) {
                $scope.open = function () {
                    $modal.open({
                        animation: true,
                        templateUrl: 'templates/time/time-range-modal.html',
                        controller: 'SwcTimeRangeWindowCtrl'
                    });
                };
            }]);