angular.module('n52.core.dataLoading', [])
        .filter('isDataLoading', function () {
            return function (timeseries) {
                if (Object.keys(timeseries).length > 0) {
                    var loading = false;
                    angular.forEach(timeseries, function (item) {
                        if (item.loadingData)
                            loading = true;
                    });
                    return loading;
                }
                return false;
            };
        });

        