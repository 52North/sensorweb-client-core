angular.module('n52.core.timeUi')
        .controller('SwcCustomDateTimeRangeWithMaxTimeperiodCtrl', ['$scope', 'timeService', 'settingsService',
          function ($scope, timeService, settingsService) {
            $scope.startDate = timeService.time.start.toDate();
            $scope.endDate = timeService.time.end.toDate();

            $scope.confirmCustomRange = function (start, end) {
              timeService.setFlexibleTimeExtent(moment(start), moment(end));
            };

            if (settingsService.maxTimeperiod) {
              var maxTimeperiod = moment.duration(settingsService.maxTimeperiod);
              $scope.minDate = moment($scope.endDate).subtract(maxTimeperiod);
              $scope.maxDate = moment($scope.startDate).add(maxTimeperiod);
              $scope.$watch('startDate', function (newStart) {
                $scope.maxDate = moment(newStart).add(maxTimeperiod);
              }, true);
              $scope.$watch('endDate', function (newEnd) {
                $scope.minDate = moment(newEnd).subtract(maxTimeperiod);
              }, true);
            }
          }]);