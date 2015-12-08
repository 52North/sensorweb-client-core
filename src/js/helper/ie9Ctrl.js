angular.module('n52.core.helper')
        .controller('IsIE9Ctrl', ['$scope',
            function ($scope) {
                isIe9 = function () {
                    debugger;
                    if (navigator.appVersion.indexOf("MSIE") !== -1)
                    {
                        version = parseFloat(navigator.appVersion.split("MSIE")[1]);
                        return version === 9;
                    }
                    return false;
                };
                $scope.isIE9 = isIe9();
                debugger;
            }]);