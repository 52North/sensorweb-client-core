angular.module('n52.core.legend')
        .controller('SwcOpenStyleModalCtrl', ['$scope', 'styleModalOpener',
            function ($scope, styleModalOpener) {
                $scope.openStyling = function (ts) {
                    styleModalOpener(ts);
                };
            }]);