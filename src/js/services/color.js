angular.module('colorModule', [])
        .factory('colorService', ['settingsService', function (settingsService) {
                var defaultColorList = ['#1abc9c', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50', '#f1c40f',
                    '#d35400', '#c0392b', '#7f8c8d'];
                var colorList = settingsService.colorList || defaultColorList;

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

                return  {
                    stringToColor: function (string) {
                        if (!string)
                            return "#000000";
                        return "#" + _intToColorHex(_hashCode(string));
                    },
                    colorList: colorList
                };
            }]);