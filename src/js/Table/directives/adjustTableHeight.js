angular.module('n52.core.table')
        .directive('adjustTableHeight', ['ngTableEventsChannel',
            function (ngTableEventsChannel) {
                return {
                    restrict: 'A',
                    link: function (scope, element, attrs) {
                        findParentHeightElement = function (elem) {
                            if (elem.height() > 0) {
                                return elem;
                            } else {
                                return findParentHeightElement(elem.parent());
                            }
                        };
                        var parent = findParentHeightElement(element);
                        ngTableEventsChannel.onAfterReloadData(function () {
                            element.height(parent.height() - element.find('thead').height() - 2);
                        }, scope);
                    }
                };
            }]);