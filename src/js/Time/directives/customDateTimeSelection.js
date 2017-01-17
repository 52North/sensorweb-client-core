// uses https://github.com/smalot/bootstrap-datetimepicker
angular.module('n52.core.timeUi')
        .directive('swcCustomDateTimeSelection', ['settingsService', 'timeService', '$translate',
            function (settingsService, timeService, $translate) {
                return {
                    restrict: 'E',
                    templateUrl: 'n52.core.timeUi.custom-time-range-selection',
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
                        };
                    }
                };
            }]);
