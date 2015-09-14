angular.module('n52.core.translate', ['n52.core.permalinkEval'])
        .service('translateService', ['$translate', 'permalinkEvaluationService', function ($translate, permalinkEvaluationService) {
                var lang = permalinkEvaluationService.getParam('lang');
                if(angular.isString(lang)) {
                    $translate.use(lang);
                }

                return {
                };
            }]);