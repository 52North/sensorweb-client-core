angular.module('n52.core.listSelection')
        .controller('SwcModalListSelectionCtrl', ['$scope',
            function ($scope) {
                $scope.categoryParams = [
                    {
                        type: 'category',
                        header: 'listSelection.headers.category'
                    },
                    {
                        type: 'feature',
                        header: 'listSelection.headers.station'
                    },
                    {
                        type: 'phenomenon',
                        header: 'listSelection.headers.phenomenon'
                    },
                    {
                        type: 'procedure',
                        header: 'listSelection.headers.procedure'
                    }
                ];

                $scope.stationParams = [
                    {
                        type: 'feature',
                        header: 'listSelection.headers.station'
                    },
                    {
                        type: 'category',
                        header: 'listSelection.headers.category'
                    },
                    {
                        type: 'phenomenon',
                        header: 'listSelection.headers.phenomenon'
                    },
                    {
                        type: 'procedure',
                        header: 'listSelection.headers.procedure'
                    }
                ];

                $scope.phenomenonParams = [
                    {
                        type: 'phenomenon',
                        header: 'listSelection.headers.phenomenon'
                    },
                    {
                        type: 'category',
                        header: 'listSelection.headers.category'
                    },
                    {
                        type: 'feature',
                        header: 'listSelection.headers.station'
                    },
                    {
                        type: 'procedure',
                        header: 'listSelection.headers.procedure'
                    }
                ];
            }]);