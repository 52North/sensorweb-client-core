angular.module('n52.core.table')
        .directive('whenScrollEnds', function () {
            return {
                restrict: "A",
                link: function (scope, element, attrs) {
                    findParentHeightElement = function (elem) {
                        if (elem.height() > 0) {
                            return elem;
                        } else {
                            return findParentHeightElement(elem.parent());
                        }
                    };
                    var parent = findParentHeightElement(element);
                    var visibleHeight = parent.height();
                    var threshold = 100;
                    parent.scroll(function () {
                        var scrollableHeight = parent.prop('scrollHeight');
                        var hiddenContentHeight = scrollableHeight - visibleHeight;
                        if (hiddenContentHeight - parent.scrollTop() <= threshold) {
                            // Scroll is almost at the bottom. Loading more rows
                            scope.$apply(attrs.whenScrollEnds);
                        }
                    });
                }
            };
        });