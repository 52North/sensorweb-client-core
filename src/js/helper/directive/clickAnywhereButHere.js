angular.module('n52.core.helper')
        .directive('clickAnywhereButHere', ['$document', function ($document) {
                return {
                    restrict: 'A',
                    link: function (scope, elem, attr) {
                        var elemClickHandler = function (e) {
                            e.stopPropagation();
                        };
                        var docClickHandler = function () {
                            scope.$apply(attr.clickAnywhereButHere);
                        };
                        elem.on('click', elemClickHandler);
                        $document.on('click', docClickHandler);
                        // teardown the event handlers when the scope is destroyed.
                        scope.$on('$destroy', function () {
                            elem.off('click', elemClickHandler);
                            $document.off('click', docClickHandler);
                        });
                    }
                };
            }]);