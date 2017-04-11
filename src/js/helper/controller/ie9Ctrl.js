angular.module('n52.core.helper')
        .controller('IsIE9Ctrl', ['$scope',
            function ($scope) {
                var isIe9 = function () {
                    if (navigator.appVersion.indexOf('MSIE') !== -1)
                    {
                        var version = parseFloat(navigator.appVersion.split('MSIE')[1]);
                        return version === 9;
                    }
                    return false;
                };
                $scope.isIE9 = isIe9();
            }]);
