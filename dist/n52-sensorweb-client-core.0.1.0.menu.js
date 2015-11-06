var menuModule = angular.module('n52.core.menu', ['n52.core.timeseries', 'n52.core.status', 'n52.core.diagram', 'n52.core.table', 'n52.core.favorite'])
        .controller('menu', [
            '$scope',
            'timeseriesService',
            'statusService',
            'diagramBehaviourService',
            function ($scope, timeseriesService, statusService, diagramBehaviourService) {
                $scope.timeseries = timeseriesService.timeseries;
                var showYAxis = true;

                $scope.addTs = function () {
                    timeseriesService.addTimeseriesById("133", statusService.status.apiProvider.url);
                    timeseriesService.addTimeseriesById("186", statusService.status.apiProvider.url);
                };

                $scope.showYAxis = function () {
                    showYAxis = !showYAxis;
                    diagramBehaviourService.changeYAxis(showYAxis);
                };
            }])
        .controller('ToggleCtrl', ['$scope', function ($scope) {
                $scope.isToggled = false;
                $scope.toggle = function () {
                    $scope.isToggled = !$scope.isToggled;
                };
            }]);
angular.module('n52.core.modal', ['ui.bootstrap'])
        .service('modalOpener', ['$modal',
            function ($modal) {
                this.open = function (configs) {
                    var defaults = {
                        animation: true,
                        controller: 'ModalWindowCtrl'
                    };
                    angular.extend(defaults, configs);
                    $modal.open(defaults);
                };
            }])
        .controller('ModalWindowCtrl', ['$scope', '$modalInstance',
            function ($scope, $modalInstance) {
                $scope.modal = $modalInstance;
                $scope.close = function () {
                    $modalInstance.close();
                };
            }]);