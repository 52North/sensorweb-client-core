angular.module('n52.core.timeRange')
        .controller('SwcTimeRangeCtrl', ['$scope', 'modalOpener',
            function ($scope, modalOpener) {
                $scope.open = function () {
                    modalOpener.open({
                        templateUrl: 'templates/time/time-range-modal.html'
                    });
                };
            }]);