angular.module('n52.core.startup')
        .service('SetLanguageService', ['$translate', 'permalinkEvaluationService',
            function ($translate, permalinkEvaluationService) {
                this.setsParameters = function () {
                    var lang = permalinkEvaluationService.getParam('lang');
                    if (angular.isString(lang)) {
                        $translate.use(lang);
                    }
                }
            }]);