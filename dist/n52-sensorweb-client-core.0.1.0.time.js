(function($){
	$.fn.datetimepicker.dates.de = {
		days: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
		daysShort: ["Son", "Mon", "Die", "Mit", "Don", "Fre", "Sam", "Son"],
		daysMin: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
		months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
		monthsShort: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
		today: "Heute",
		suffix: [],
		meridiem: [],
		weekStart: 1,
		format: "dd.mm.yyyy"
	};
}(window.jQuery));

angular.module('n52.core.timeRange', ['n52.core.time', 'ui.bootstrap', 'n52.core.settings'])
        .controller('TimeRangeCtrl', ['$scope', '$modal',
            function ($scope, $modal) {
                $scope.temp = 'horst';
                $scope.open = function () {
                    $modal.open({
                        animation: true,
                        templateUrl: 'templates/time/time-range-modal.html',
                        controller: 'TimeRangeWindowCtrl'
                    });
                };
            }])
        .controller('TimeRangeWindowCtrl', ['$scope', '$modalInstance',
            function ($scope, $modalInstance) {
                $scope.modalInstance = $modalInstance;
            }])
        .controller('PredefinedTimeRangeControls', ['$scope', 'settingsService',
            function ($scope, settingsService) {
                $scope.items = settingsService.timeRangeData.presets;
            }])
        .directive('swcPredefinedTimeRangeButton', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/time/predefined-time-range-button.html',
                controller: ['$scope', 'timeService',
                    function ($scope, timeService) {
                        $scope.newTimeExtent = function () {
                            timeService.setPresetInterval($scope.item.interval);
                            $scope.modalInstance.close();
                        };
                    }]
            };
        })
        .directive('swcCustomDateTimeSelection', ['settingsService', 'timeService', '$translate',
            function (settingsService, timeService, $translate) {
                return {
                    restrict: 'E',
                    templateUrl: 'templates/time/custom-time-range-selection.html',
                    link: function ($scope, element, attrs) {
                        var evaluateDate = function (ev) {
                            var id = "#" + ev.currentTarget.id;
                            if (moment($('#startPicker').data('date')).isAfter($('#endPicker').data('date'))) {
                                $('#alertTimeExtent').show();
                                $('#confirmTimeExtent').addClass('disabled');
                                $('#alertTimeExtent').text($translate.instant('timeSelection.warning.startBeforeEnd'));
                            } else if (Math.abs(moment($('#startPicker').data('date')).diff($('#endPicker').data('date'), 'years', true)) > 1) {
                                $('#alertTimeExtent').show();
                                $('#confirmTimeExtent').addClass('disabled');
                                $('#alertTimeExtent').text($translate.instant('timeSelection.warning.maxTimeRange'));
                            } else {
                                $('#alertTimeExtent').hide();
                                $('#confirmTimeExtent').removeClass('disabled');
                                startDate = new Date(ev.date);
                            }
                            $(id).text(moment($(id).data('date')).format(settingsService.dateformat));
                            $(id).datetimepicker('hide');
                        };

                        var from = moment(timeService.time.start);
                        var till = moment(timeService.time.end);
                        $('#startPicker').text(from.format(settingsService.dateformat));
                        $('#endPicker').text(till.format(settingsService.dateformat));
                        $('#startPicker').data('date', from.format('YYYY-MM-DD HH:mm'));
                        $('#endPicker').data('date', till.format('YYYY-MM-DD HH:mm'));
                        $('#alertTimeExtent').hide();
                        var options = {
                            pickerPosition: 'top-right',
                            autoclose: true,
                            format: 'yyyy-mm-dd hh:ii',
                            weekStart: 1,
                            language: $translate.use()
                        };
                        $('#startPicker').datetimepicker(options).on('changeDate', evaluateDate);
                        $('#endPicker').datetimepicker(options).on('changeDate', evaluateDate);

                        $scope.confirmCustomTimeRange = function () {
                            var start = moment($('#startPicker').data('date'));
                            var end = moment($('#endPicker').data('date'));
                            timeService.setFlexibleTimeExtent(start, end);
                            $scope.modalInstance.close();
                        };
                    }
                };
            }]);
angular.module('n52.core.timeSelectorButtons', ['n52.core.time', 'n52.core.timeRange'])
        .directive('swcTimeSelectorButtons', function () {
            return {
                restrict: 'E',
                templateUrl: 'templates/time/time-selector-buttons.html',
                controller: ['$scope', 'timeService',
                    function ($scope, timeService) {
                        $scope.time = timeService.time;

                        $scope.back = function () {
                            timeService.stepBack();
                        };

                        $scope.forward = function () {
                            timeService.stepForward();
                        };
                    }]
            };
        });