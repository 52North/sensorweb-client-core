angular.module('n52.core.phenomena')
        .controller('SwcPhenomenonListCtrl', ['$scope', 'PhenomenonListFactory', function ($scope, PhenomenonListFactory) {
                $scope.phenomena = PhenomenonListFactory.phenomena;

                $scope.showAllPhenomenons = function () {
                    PhenomenonListFactory.setSelection();
                };

                $scope.showSpecificPhenomenon = function (phenomenon) {
                    PhenomenonListFactory.setSelection(phenomenon);
                };

                $scope.isSelected = function (phenomenon) {
                    return angular.equals(phenomenon, $scope.phenomena.selection);
                };
            }]);