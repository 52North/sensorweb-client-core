angular.module('n52.core.diagram')
        .factory('diagramBehaviourService', function () {
            var behaviour = {};
            behaviour.showYAxis = true;

            function toggleYAxis() {
                behaviour.showYAxis = !behaviour.showYAxis;
            }
            return {
                behaviour: behaviour,
                toggleYAxis: toggleYAxis
            };
        })