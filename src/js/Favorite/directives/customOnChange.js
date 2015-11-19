angular.module('n52.core.favoriteUi')
        .directive('customOnChange', ['$window', function ($window) {
                return {
                    restrict: 'A',
                    link: function (scope, element, attrs) {
                        var isIOS = $window.navigator.userAgent.match(/(iPad|iPhone|iPod)/g) !== null;
                        var isFileAPISupported = ($window.File && $window.FileReader && $window.Blob) && !isIOS;
                        if (isFileAPISupported) {
                            var onChangeHandler = scope.$eval(attrs.customOnChange);
                            element.bind('change', onChangeHandler);
                        } else {
                            element.remove();
                        }
                    }
                };
            }]);