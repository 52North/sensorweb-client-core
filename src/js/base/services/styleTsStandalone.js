angular.module('n52.core.base')
    .factory('styleServiceStandalone', ['colorService',
        function(colorService) {

            function createStyle(ts, colour, zeroScaled, groupedAxis, selected, visible) {

                var styles = {};

                styles.color = colour || ts.renderingHints && ts.renderingHints.properties.color || colorService.getColor(ts.id);
                styles.zeroScaled = zeroScaled;
                styles.groupedAxis = groupedAxis;
                styles.selected = selected;
                styles.visible = visible;

                angular.forEach(ts.referenceValues, function(refValue) {
                    refValue.color = colorService.getRefColor(refValue.referenceValueId);
                });

                return styles;
            }

            return {
                createStyle: createStyle
            };
        }
    ]);
