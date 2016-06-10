angular.module('n52.core.timeUi')
        .controller('SwcCustomDateTimeRangeCtrl', ['$scope', 'timeService',
          function ($scope, timeService) {
            $scope.startDate = timeService.time.start.toDate();
            $scope.endDate = timeService.time.end.toDate();
            $scope.confirmCustomRange = function (start, end) {
              timeService.setFlexibleTimeExtent(moment(start), moment(end));
            };
          }]);