angular.module('n52.core.diagram')
    .factory('monthNamesTranslaterServ', ['$translate',
        function($translate) {
            getMonthNames = function() {
                return [
                    $translate.instant('chart.monthNames.jan'),
                    $translate.instant('chart.monthNames.feb'),
                    $translate.instant('chart.monthNames.mar'),
                    $translate.instant('chart.monthNames.apr'),
                    $translate.instant('chart.monthNames.may'),
                    $translate.instant('chart.monthNames.jun'),
                    $translate.instant('chart.monthNames.jul'),
                    $translate.instant('chart.monthNames.aug'),
                    $translate.instant('chart.monthNames.sep'),
                    $translate.instant('chart.monthNames.oct'),
                    $translate.instant('chart.monthNames.nov'),
                    $translate.instant('chart.monthNames.dec')
                ];
            };
            return {
                getMonthNames: getMonthNames
            };
        }
    ]);
