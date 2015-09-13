angular.module('translateCore', ['permalinkEvalCore'])
        .service('translateService', ['$translate', 'permalinkEvaluationService', function ($translate, permalinkEvaluationService) {
                var lang = permalinkEvaluationService.getParam('lang');
                if(angular.isString(lang)) {
                    $translate.use(lang);
                }

                return {
                };
            }]);