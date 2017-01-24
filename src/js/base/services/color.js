angular.module('n52.core.base')
    .factory('colorService', ['settingsService', 'colorPool',
        function(settingsService, colorPool) {

            var colorList,
                refColorList,
                selectFromList;

            function init() {

                colorList = settingsService.colorList;
                refColorList = settingsService.refColorList || [];
                selectFromList = settingsService.selectColorFromList || false;
                colorPool.setColors(colorList);
                colorPool.setRefColors(refColorList);
            }

            init();

            function _hashCode(str) {
                var hash = 0;
                for (var i = 0; i < str.length; i++) {
                    hash = str.charCodeAt(i) + ((hash << 5) - hash);
                }
                return hash;
            }

            function _intToColorHex(i) {
                var rgb = ((i >> 16) & 0xFF).toString(16) +
                    ((i >> 8) & 0xFF).toString(16) +
                    (i & 0xFF).toString(16);
                rgb = rgb.toString();
                while (rgb.length < 6) {
                    rgb = "0" + rgb;
                }
                return rgb;
            }

            function _stringToColor(string) {
                if (!string)
                    return "#000000";
                return "#" + _intToColorHex(_hashCode(string));
            }

            function getColor(string) {
                var color;
                if (selectFromList) {
                    color = colorPool.getColor();
                }
                return color ? color : _stringToColor(string);
            }

            function getRefColor(string) {
                var color;
                if (selectFromList) {
                    color = colorPool.getRefColor();
                }
                return color ? color : _stringToColor(string);
            }

            function removeColor(color) {
                colorPool.removeColor(color);
            }

            function removeRefColor(color) {
                colorPool.removeRefColor(color);
            }

            return {
                getColor: getColor,
                getRefColor: getRefColor,
                removeColor: removeColor,
                removeRefColor: removeRefColor,
                colorList: colorList
            };
        }
    ])
    .factory('colorPool', [function() {
        var colorPool;
        var refColorPool;

        function _createPool(list) {
            var pool = {};
            angular.forEach(list, function(color) {
                pool[color] = true;
            });
            return pool;
        }

        function _getColorOfPool(pool) {
            var color;
            angular.forEach(pool, function(available, entry) {
                if (!color && available) {
                    color = entry;
                }
            });
            if (color)
                pool[color] = false;
            return color;
        }

        function _removeColorFromPool(color, pool) {
            if (angular.isDefined(pool[color])) {
                pool[color] = true;
            }
        }

        function setColors(list) {
            colorPool = _createPool(list);
        }

        function getColor() {
            return _getColorOfPool(colorPool);
        }

        function removeColor(color) {
            _removeColorFromPool(color, colorPool);
        }

        function setRefColors(list) {
            refColorPool = _createPool(list);
        }

        function getRefColor() {
            return _getColorOfPool(refColorPool);
        }

        function removeRefColor(color) {
            _removeColorFromPool(color, refColorPool);
        }

        return {
            setColors: setColors,
            setRefColors: setRefColors,
            getColor: getColor,
            removeColor: removeColor,
            getRefColor: getRefColor,
            removeRefColor: removeRefColor
        };
    }]);
