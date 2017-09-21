/*global d3*/
angular.module('n52.core.mobile')
    .directive('swcCombiMobile', [
        function() {
            return {
                restrict: 'E',
                templateUrl: 'n52.core.mobile.combi-mobile',
                replace: true,
                controller: ['$scope', 'combinedSrvc', 'leafletData',
                    function($scope, combinedSrvc, leafletData) {
                        var mouseValueLabel, mouseTimeLabel, pointG, mouseRect, highlighterGraph;
                        $scope.events = {
                            geometry: {
                                enable: ['mouseover']
                            }
                        };
                        $scope.coordinates = combinedSrvc.coordinates;
                        $scope.data = combinedSrvc.data;
                        $scope.series = combinedSrvc.series;
                        $scope.providerUrl = combinedSrvc.providerUrl;
                        $scope.selectedSection = combinedSrvc.selectedSection;
                        $scope.options = combinedSrvc.options;
                        $scope.additionalDatasets = combinedSrvc.additionalDatasets;
                        $scope.paths = {};

                        $scope.$watchCollection('coordinates', function(coordinates) {
                            showData(coordinates.values);
                            centerMap();
                            resetHighlighter();
                        }, true);

                        $scope.$watch('options.highlightIdx', function() {
                            if ($scope.options.highlightIdx) {
                                drawMapMarker($scope.data.values[$scope.options.highlightIdx]);
                            } else {
                                hideMapMarker();
                            }
                        }, true);

                        $scope.$watch('options.mapPath', function(mapPath) {
                            showSelection(combinedSrvc.selectedSection, mapPath, false);
                            showData(combinedSrvc.coordinates.values);
                        }, true);

                        $scope.$on('leafletDirectiveMap.mobileCombiMap.zoomend', function() {
                            if ($scope.options.highlightIdx !== undefined) {
                                drawMapMarker($scope.data.values[$scope.options.highlightIdx]);
                            }
                        });

                        $scope.$watchCollection('selectedSection', function(selection) {
                            showSelection(selection, $scope.options.mapPath, true);
                        }, true);

                        $scope.$on('leafletDirectiveGeoJson.mobileCombiMap.mouseover', function(event, path) {
                            if (path && path.leafletEvent && path.leafletEvent.latlng) {
                                combinedSrvc.showHighlightedItem(path.leafletEvent.latlng);
                            }
                        });

                        $scope.onSelectedPhenomenaChanged = function(phenomenaList) {
                            if (phenomenaList && phenomenaList.length !== 0) {
                                $scope.phenomenaList = phenomenaList.filter(entry => entry.selected).map(entry => entry.id);
                                combinedSrvc.setPhenomenaSelection($scope.phenomenaList);
                            }
                        };

                        var centerMap = function() {
                            if ($scope.geometry && $scope.geometry.data.coordinates.length > 0) {
                                leafletData.getMap('mobileCombiMap').then(function(map) {
                                    var latlngs = [];
                                    angular.forEach($scope.geometry.data.coordinates, function(coords) {
                                        latlngs.push(L.GeoJSON.coordsToLatLng(coords));
                                    });
                                    map.fitBounds(latlngs);
                                });
                            }
                        };

                        var showData = (coordinates) => {
                            $scope.geometry = {
                                data: {
                                    coordinates: [],
                                    type: 'MultiPoint'
                                }
                            };
                            if ($scope.options.mapPath) {
                                $scope.geometry.style = {
                                    weight: 2,
                                    opacity: 1,
                                    color: 'red',
                                    dashArray: '10, 5',
                                    clickable: true
                                };
                                $scope.geometry.data = {
                                    type: 'LineString'
                                };
                            } else {
                                $scope.geometry.pointToLayer = function(feature, latlng) {
                                        return L.circleMarker(latlng, {
                                            radius: 1,
                                            weight: 1,
                                            color: 'red',
                                            fillColor: 'red',
                                            opacity: 1
                                        });
                                    },
                                    $scope.geometry.data = {
                                        type: 'MultiPoint'
                                    };
                            }
                            $scope.geometry.data.coordinates = coordinates;
                            $scope.seriesId = $scope.series.id;
                            $scope.providerUrl = $scope.series.providerUrl;
                        };

                        var showSelection = (selection, path, center) => {
                            if (selection && selection.values && selection.values.length > 0) {
                                $scope.paths = {
                                    path: {
                                        color: 'blue',
                                        weight: 3,
                                        latlngs: []
                                    }
                                };
                                var ll = [];
                                angular.forEach(selection.values, function(value, idx) {
                                    if (path) {
                                        $scope.paths.path.latlngs.push({
                                            lat: value.latlng.lat,
                                            lng: value.latlng.lng
                                        });
                                    } else {
                                        $scope.paths['section' + idx] = {
                                            color: 'blue',
                                            fillColor: 'blue',
                                            latlngs: {
                                                lat: value.latlng.lat,
                                                lng: value.latlng.lng
                                            },
                                            radius: 1,
                                            weight: 3,
                                            type: 'circleMarker'
                                        };
                                    }
                                    ll.push(value.latlng);
                                });
                                leafletData.getPaths('mobileCombiMap').then(function(paths) {
                                    paths.path.bringToFront();
                                });
                                if (center) {
                                    leafletData.getMap('mobileCombiMap').then(function(map) {
                                        map.fitBounds(ll);
                                    });
                                }
                            } else {
                                if (center) centerMap();
                                $scope.paths = {};
                            }
                        };

                        function resetHighlighter() {
                            if (pointG) {
                                pointG.remove();
                                mouseRect.remove();
                                mouseValueLabel.remove();
                                mouseTimeLabel.remove();
                                pointG = undefined;
                            }
                        }

                        function drawMapMarker(highlighted) {
                            leafletData.getMap('mobileCombiMap').then(function(map) {
                                var layerpoint = map.latLngToLayerPoint(highlighted.latlng);

                                if (!pointG) {
                                    highlighterGraph = d3.select('.leaflet-overlay-pane svg')
                                        .append('g');

                                    pointG = highlighterGraph.append('g');
                                    pointG.append('svg:circle')
                                        .attr('r', 6)
                                        .attr('cx', 0)
                                        .attr('cy', 0)
                                        .attr('class', 'height-focus circle-lower');

                                    mouseRect = highlighterGraph.append('svg:rect')
                                        .attr('class', 'map-highlight-label');
                                    mouseValueLabel = highlighterGraph.append('svg:text')
                                        .attr('class', 'focus-label')
                                        .style('pointer-events', 'none');
                                    mouseTimeLabel = highlighterGraph.append('svg:text')
                                        .attr('class', 'focus-label')
                                        .style('pointer-events', 'none');
                                }

                                highlighterGraph.moveToFront();

                                pointG.attr('transform', 'translate(' + layerpoint.x + ',' + layerpoint.y + ')')
                                    .style('visibility', 'visible');
                                mouseValueLabel.attr('x', layerpoint.x + 10)
                                    .attr('y', layerpoint.y)
                                    .text(highlighted.value + $scope.series.uom)
                                    .style('visibility', 'visible');
                                mouseTimeLabel.attr('x', layerpoint.x + 10)
                                    .attr('y', layerpoint.y + 13)
                                    .text(moment(highlighted.timestamp).format('DD.MM.YY HH:mm'))
                                    .style('visibility', 'visible');
                                mouseRect.attr('x', layerpoint.x + 8)
                                    .attr('y', layerpoint.y - 11)
                                    .attr('width', 100)
                                    .attr('height', 28);
                            });
                        }

                        function hideMapMarker() {
                            if (mouseRect) {
                                mouseTimeLabel.style('visibility', 'hidden');
                                mouseValueLabel.style('visibility', 'hidden');
                                mouseRect.style('visibility', 'hidden');
                            }
                            if (pointG) {
                                pointG.style('visibility', 'hidden');
                            }
                        }
                    }
                ]
            };
        }
    ]);
