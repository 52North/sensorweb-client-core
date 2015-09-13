angular.module('styleModule', ['ui.bootstrap'])
        .controller('ModalStyleEditorCtrl', ['$scope', 'timeseries', '$modalInstance',
            function ($scope, timeseries, $modalInstance) {
                $scope.timeseries = timeseries;

                $scope.modalInstance = $modalInstance;

                $scope.close = function () {
                    $modalInstance.close();
                };
            }])
        .service('styleModalOpener', ['$modal', function ($modal) {
                return function (timeseries) {
                    $modal.open({
                        animation: true,
                        templateUrl: 'templates/styling/modal-style-editor.html',
                        resolve: {
                            timeseries: function () {
                                return timeseries;
                            }
                        },
                        controller: 'ModalStyleEditorCtrl'
                    });
                };
            }])
        .directive('swcColorChooser', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/styling/color-chooser.html',
                controller: ['$scope', 'colorService', 'styleService',
                    function ($scope, colorService, styleService) {
                        $scope.colorList = colorService.colorList;

                        $scope.selectColor = function (ts, color) {
                            styleService.updateColor(ts, color);
                            $scope.modalInstance.close();
                        };
                    }]
            };
        })
        .directive('swcZeroBasedAxisToggler', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/styling/zero-based-axis-toggler.html',
                controller: ['$scope', 'styleService', function ($scope, styleService) {
                    $scope.setZeroScaled = function (ts) {
                        styleService.updateZeroScaled(ts);
                        $scope.modalInstance.close();
                    };
                }]
            };
        })
        .directive('swcGroupAxisToggler', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/styling/group-axis-toggler.html',
                controller: ['$scope', 'styleService', function ($scope, styleService) {
                    $scope.setGroupedAxis = function (ts) {
                        styleService.updateGroupAxis(ts);
                        $scope.modalInstance.close();
                    };
                }]
            };
        })
        .directive('swcBarToggler', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/styling/bar-toggler.html',
                controller: ['$scope', 'styleService', function ($scope, styleService) {
                    $scope.intervals = styleService.intervalList;
                    $scope.setInterval = function (ts, interval) {
                        styleService.updateInterval(ts, interval);
                        $scope.modalInstance.close();
                    };
                }]
            };
        });