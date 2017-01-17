angular.module('n52.core.timeUi')
        .controller('SwcTimeRangeCtrl', ['$scope', 'modalOpener',
            function ($scope, modalOpener) {
                $scope.open = function () {
                    modalOpener.open({
                        templateUrl: 'n52.core.timeUi.time-range-modal'
                    });
                };
            }]);
