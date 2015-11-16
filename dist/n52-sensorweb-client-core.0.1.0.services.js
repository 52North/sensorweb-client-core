angular.module('n52.core.alert', [])
        .factory('alertService', ['$translate', function ($translate) {

            function error(message) {
                _createMessage($translate.instant('inform.error'), message);
            }
            function warn(message) {
                _createMessage($translate.instant('inform.warn'), message);
            }
            function _createMessage(level, message) {
                alert(level + "\n" + message);
            }
            return  {
                error: error,
                warn: warn
            };
        }]);
angular.module('n52.core.barChart', [])
        .factory('barChartHelperService', function () {
            function intervalToHour(interval) {
                switch (interval) {
                    case "byHour":
                        return 1;
                    case "byDay":
                        return 24;
                    case "byWeek":
                        return 7 * 24;
                    case "byMonth":
                        return 30 * 24;
                    default:
                        return 1;
                }
            }

            function sumForInterval(data, interval) {
                var sumvalues = [];
                var range = intervalToHour(interval);
                var idx = 0;
                var entry = data[idx];
                while (entry) {
                    var startInterval = entry[0];
                    var endInterval = moment(entry[0]).add(range, 'hours');
                    var sum = 0;
                    while (entry && moment(entry[0]).isBefore(endInterval)) {
                        idx++;
                        sum = sum + entry[1];
                        entry = data[idx];
                    }
                    sumvalues.push([startInterval, sum]);
                }
                return sumvalues;
            }

            return  {
                intervalToHour: intervalToHour,
                sumForInterval: sumForInterval
            };
        });
angular.module('n52.core.color', [])
        .factory('colorService', ['settingsService', 'colorPool', function (settingsService, colorPool) {
                var defaultColorList = ['#1abc9c', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50', '#f1c40f',
                    '#d35400', '#c0392b', '#7f8c8d'];
                var colorList = settingsService.colorList || defaultColorList;
                var refColorList = settingsService.refColorList || [];
                var selectFromList = settingsService.selectColorFromList || false;
                
                colorPool.setColors(colorList);
                colorPool.setRefColors(refColorList);
                
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

                return  {
                    getColor: getColor,
                    getRefColor: getRefColor,
                    removeColor: removeColor,
                    removeRefColor: removeRefColor,
                    colorList: colorList
                };
            }])
        .factory('colorPool', [function () {
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
                        if(!color && available) {
                            color = entry;
                        }
                    });
                    if (color) pool[color] = false;
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
angular.module('n52.core.favorite', ['LocalStorageModule'])
        .factory('favoriteService', ['localStorageService', '$translate', 'settingsService', 'interfaceService',
            function (localStorageService, $translate, settingsService, interfaceService) {
                var storageKey = 'favorites';
                var favorites = {};
                var groupIdx = Object.keys(favorites).length;

                // load favorites
                setFavorites(localStorageService.get(storageKey));

                function saveFavorites() {
                    localStorageService.set(storageKey, favorites);
                }

                function addFavorite(ts, label) {
                    label = label || ts.label;
                    favorites[ts.internalId] = {
                        id: ts.internalId,
                        label: label,
                        type: 'single',
                        timeseries: angular.copy(ts)
                    };
                    saveFavorites();
                    return label;
                }

                function addFavoriteGroup(tsColl, label) {
                    var collection = [];
                    angular.forEach(tsColl, function (elem) {
                        collection.push(angular.copy(elem));
                    });
                    if (collection.length !== 0) {
                        label = label || $translate.instant('favorite.label') + ' ' + groupIdx;
                        favorites[groupIdx] = {
                            id: groupIdx,
                            label: label,
                            type: 'group',
                            collection: collection
                        };
                        saveFavorites();
                        groupIdx++;
                        return label;
                    } else {
                        return null;
                    }
                }

                function removeFavorite(tsId) {
                    delete favorites[tsId];
                    saveFavorites();
                }
                
                function hasFavorite(tsId) {
                    return angular.isObject(favorites[tsId]);
                }

                function hasFavorites() {
                    return Object.keys(favorites).length > 0;
                }
                
                function getFavoritesCount() {
                    return Object.keys(favorites).length;
                }

                function removeAllFavorites() {
                    angular.forEach(favorites, function (elem) {
                        removeFavorite(elem.id);
                    });
                }

                function setFavorites(newFavs) {
                    removeAllFavorites();
                    angular.forEach(newFavs, function (fav) {
                        // single
                        if (fav.timeseries) {
                            if (isServiceSupported(fav.timeseries)) {
                                // send request to get latest value
                                var oldTs = fav.timeseries;
                                interfaceService.getTimeseries(oldTs.id, oldTs.apiUrl).then(function (newTs) {
                                    newTs.styles = oldTs.styles;
                                    addFavorite(newTs, fav.label);
                                });
                            }
                        }
                        // group
                        if (fav.collection) {
                            var count = 0;
                            var newColl = [];
                            angular.forEach(fav.collection, function (ts) {
                                if (isServiceSupported(ts)) {
                                    count++;
                                    interfaceService.getTimeseries(ts.id, ts.apiUrl).then(function (newTs) {
                                        newTs.styles = ts.styles;
                                        newColl.push(newTs);
                                        count--;
                                        if (count === 0) {
                                            addFavoriteGroup(newColl, fav.label);
                                        }
                                    });
                                }
                            });
                        }
                    });
                    saveFavorites();
//                $rootScope.$emit("favoritesChanged");
                }

                function setFavorite(fav) {
                    favorites[fav.id] = fav;
                    saveFavorites();
                }

                function isServiceSupported(ts) {
                    var supported = false;
                    angular.forEach(settingsService.restApiUrls, function (id, url) {
                        if (angular.equals(url, ts.apiUrl))
                            supported = true;
                    });
                    return supported;
                }

                function changeLabel(favorite, label) {
                    favorites[favorite.id].label = label;
                    saveFavorites();
                }

                return {
                    addFavorite: addFavorite,
                    addFavoriteGroup: addFavoriteGroup,
                    hasFavorite: hasFavorite,
                    hasFavorites: hasFavorites,
                    setFavorites: setFavorites,
                    removeFavorite: removeFavorite,
                    removeAllFavorites: removeAllFavorites,
                    changeLabel: changeLabel,
                    getFavoritesCount: getFavoritesCount,
                    favorites: favorites
                };
            }])
        .factory('favoriteImExportService', ['favoriteService', '$translate', 'alertService', 'utils',
            function (favoriteService, $translate, alertService, utils) {
                function importFavorites(event) {
                    if (utils.isFileAPISupported() && angular.isObject(event)) {
                        var override = true;
                        if (favoriteService.hasFavorites()) {
                            override = confirm($translate.instant('favorite.import.override'));
                        }
                        if (override) {
                            var files = event.target.files;
                            if (files && files.length > 0) {
                                var reader = new FileReader();
                                reader.readAsText(files[0]);
                                reader.onerror = function () {
                                    alertService.error($translate.instant('favorite.import.wrongFile'));
                                };
                                reader.onload = $.proxy(function (e) {
                                    favoriteService.setFavorites(angular.fromJson(e.target.result));
                                }, this);
                            }
                        }
                    }
                }

                function exportFavorites() {
                    if (utils.isFileAPISupported()) {
                        var filename = 'favorites.json';
                        var content = angular.toJson(favoriteService.favorites, 2);
                        if (window.navigator.msSaveBlob) {
                            // IE version >= 10
                            var blob = new Blob([content], {
                                type: 'application/json;charset=utf-8;'
                            });
                            window.navigator.msSaveBlob(blob, filename);
                        } else {
                            // FF, Chrome ...
                            var a = document.createElement('a');
                            a.href = 'data:application/json,' + encodeURIComponent(content);
                            a.target = '_blank';
                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                        }
                    }
                }

                return {
                    importFavorites: importFavorites,
                    exportFavorites: exportFavorites
                }
                ;
            }]);
angular.module('n52.core.interface', ['ngResource', 'n52.core.status'])
        .service('interfaceService', ['$http', '$q', 'statusService', 'settingsService', 'utils',
            function ($http, $q, statusService, settingsService, utils) {

                var _createRequestConfigs = function (params) {
                    if (angular.isUndefined(params)) {
                        params = settingsService.additionalParameters;
                    } else {
                        angular.extend(params, settingsService.additionalParameters);
                    }
                    return {
                        params: params,
                        cache: true
                    };
                };

                _errorCallback = function (error, reject) {
                    if (error.data && error.data.userMessage)
                        console.error(error.data.userMessage);
                    reject(error);
                };

                _createIdString = function (id) {
                    return (id === null ? "" : id);
                };

                _pimpTs = function(ts, url) {
                    ts.apiUrl = url;
                    ts.internalId = utils.createInternalId(ts.id, url);
                    return ts;
                };

                this.getServices = function (apiUrl) {
                    return $q(function (resolve, reject) {
                        $http.get(apiUrl + 'services', _createRequestConfigs({expanded: true})).then(function(response) {
                            resolve(response.data);
                        }, function (error) {
                            _errorCallback(error, reject);
                        });
                    });
                };

                this.getStations = function (id, apiUrl, params) {
                    return $q(function (resolve, reject) {
                        $http.get(apiUrl + 'stations/' + _createIdString(id), _createRequestConfigs(params)).then(function(response) {
                            resolve(response.data);
                        }, function (error) {
                            _errorCallback(error, reject);
                        });
                    });
                };

                this.getPhenomena = function (id, apiUrl, params) {
                    return $q(function (resolve, reject) {
                        $http.get(apiUrl + 'phenomena/' + _createIdString(id), _createRequestConfigs(params)).then(function(response) {
                            resolve(response.data);
                        }, function (error) {
                            _errorCallback(error, reject);
                        });
                    });
                };

                this.getCategories = function (id, apiUrl, params) {
                    return $q(function (resolve, reject) {
                        $http.get(apiUrl + 'categories/' + _createIdString(id), _createRequestConfigs(params)).then(function(response) {
                            resolve(response.data);
                        }, function (error) {
                            _errorCallback(error, reject);
                        });
                    });
                };

                this.getFeatures = function (id, apiUrl, params) {
                    return $q(function (resolve, reject) {
                        $http.get(apiUrl + 'features/' + _createIdString(id), _createRequestConfigs(params)).then(function(response) {
                            resolve(response.data);
                        }, function (error) {
                            _errorCallback(error, reject);
                        });
                    });
                };

                this.getProcedures = function (id, apiUrl, params) {
                    return $q(function (resolve, reject) {
                        $http.get(apiUrl + 'procedures/' + _createIdString(id), _createRequestConfigs(params)).then(function(response) {
                            resolve(response.data);
                        }, function (error) {
                            _errorCallback(error, reject);
                        });
                    });
                };

                this.getTimeseries = function (id, apiUrl, params) {
                    if (angular.isUndefined(params))
                        params = {};
                    params.expanded = true;
                    params.force_latest_values = true;
                    params.status_intervals = true;
                    params.rendering_hints = true;
                    return $q(function (resolve, reject) {
                        $http.get(apiUrl + 'timeseries/' + _createIdString(id), _createRequestConfigs(params)).then(function (response) {
                            if (angular.isArray(response.data)) {
                                var array = [];
                                angular.forEach(response.data, function (ts) {
                                    array.push(_pimpTs(ts, apiUrl));
                                });
                                resolve(array);
                            } else {
                                resolve(_pimpTs(response.data, apiUrl));
                            }
                        }, function (error) {
                            _errorCallback(error, reject);
                        });
                    });
                };

                this.getTsData = function (id, apiUrl, timespan, extendedData) {
                    var params = {
                        timespan: timespan,
                        generalize: statusService.status.generalizeData || false,
                        expanded: true,
                        format: 'flot'
                    };
                    if (extendedData) {
                        angular.extend(params, extendedData);
                    }
                    return $q(function (resolve, reject) {
                        $http.get(apiUrl + 'timeseries/' + _createIdString(id) + "/getData", _createRequestConfigs(params)).then(function(response) {
                            resolve(response.data);
                        }, function (error) {
                            _errorCallback(error, reject);
                        });
                    });
                };
            }]);
angular.module('n52.core.permalinkGen', ['n52.core.timeseries'])
        .factory('permalinkGenerationService', ['$location', 'timeseriesService', 'timeService',
            function ($location, timeseriesService, timeService) {
                createTimeseriesParam = function (timeseriesId) {
                    var ids = [];
                    if (angular.isUndefined(timeseriesId)) {
                        angular.forEach(timeseriesService.getAllTimeseries(), function (elem) {
                            ids.push(elem.internalId);
                        });
                    } else {
                        ids.push(timeseriesId);
                    }
                    return "ts=" + encodeURIComponent(ids.join());
                };

                createTimeParam = function () {
                    return "timespan=" + encodeURIComponent(timeService.getCurrentTimespan());
                };

                getCurrentPermalink = function (timeseriesId) {
                    var params = [];
                    var url = $location.absUrl();
                    var link;
                    if (url.indexOf('?') > 0) {
                        link = $location.absUrl().substring(0, $location.absUrl().indexOf('?'));
                    } else {
                        link = $location.absUrl();
                    }
                    link = link + '?';
                    // create timespan
                    params.push(createTimeParam());
                    // create id list
                    params.push(createTimeseriesParam(timeseriesId));
                    return link + params.join("&");
                };

                return {
                    getCurrentPermalink: getCurrentPermalink
                };
            }]);

angular.module('n52.core.permalinkEval', ['n52.core.utils'])
        .factory('permalinkEvaluationService', ['$location', 'utils', function ($location, utils) {
                var parameters = $location.search();

                hasParam = function (name, parameters) {
                    return angular.isDefined(parameters[name]);
                };

                getParam = function (name) {
                    if (hasParam(name, parameters)) {
                        return parameters[name];
                    } else {
                        return null;
                    }
                };

                getTime = function () {
                    if (hasParam("timespan", parameters)) {
                        var timespan = parameters.timespan.split('/');
                        var time = {};
                        time.start = moment(timespan[0]);
                        time.end = moment(timespan[1]);
                        time.duration = moment.duration(time.end.diff(time.start));
                        return time;
                    }
                    return null;
                };

                getTimeseries = function () {
                    if (hasParam("ts", parameters)) {
                        var timeseries = {};
                        angular.forEach(parameters.ts.split(","), function (internalID) {
                            var comb = utils.getTimeseriesCombinationByInternalId(internalID);
                            if (Object.keys(comb).length > 0) {
                                timeseries[internalID] = comb;
                            }
                        });
                        return timeseries;
                    }
                    return null;
                };

                return {
                    getParam: getParam,
                    getTime: getTime,
                    getTimeseries: getTimeseries
                };
            }]);
angular.module('n52.core.settings', [])
        .service('settingsService', ['config', function (config) {
                var settings = {
                    // For more informations about the settings options, please check: http://52north.github.io/js-sensorweb-client
                    // The entries in this list will be removed from the provider list offered to the user
                    providerBlackList: [
                        {
                            serviceID: 'srv_6d9ccea8d609ecb74d4a512922bb7cee', // ircel
                            apiUrl: 'http://sensorweb.demo.52north.org/sensorwebclient-webapp-stable/api/v1/'
                        },
                        {
                            serviceID: 'srv_7cabc8c30a85fab035c95882df6db343', // BfG sos
                            apiUrl: 'http://sensorweb.demo.52north.org/sensorwebclient-webapp-stable/api/v1/'
                        },
                        {
                            serviceID: 'srv_7cabc8c30a85fab035c95882df6db343', // Wupperverbands-SOS
                            apiUrl: 'http://sensorweb.demo.52north.org/sensorwebclient-webapp-stable/api/v1/'
                        }
                    ],
                    // A list of timeseries-API urls and an appropriate identifier to create internal timeseries ids
                    restApiUrls: {
//		'http://192.168.1.135:8080/sensorwebclient-webapp/api/v1/' : 'localhost'
//		'http://localhost:8090/sensorwebclient-webapp-3.3.0-SNAPSHOT/api/v1/' : 'localhost'
                        'http://sensorweb.demo.52north.org/sensorwebclient-webapp-stable/api/v1/': '52nSensorweb',
                        'http://sosrest.irceline.be/api/v1/': 'irceline',
                        'http://www.fluggs.de/sos2/api/v1/': 'fluggs',
                        'http://sensors.geonovum.nl/sos/api/v1/': 'geonovum'
                    },
                    // default selected provider
                    defaultProvider: {
                        serviceID: 'srv_738111ed219f738cfc85be0c8d87843c',
                        url: 'http://sensorweb.demo.52north.org/sensorwebclient-webapp-stable/api/v1/'
                    },
                    // default setting for clustering stations
                    clusterStations: true,
                    // default setting for generalization of the data
                    generalizeData: true,
                    // default setting for save status
                    saveStatus: false,
                    // default setting for concentration marker
                    concentrationMarker: false,
                    // base layer in the map
                    baselayer: {},
                    // overlay layer in the map
                    overlays: {},
                    // zoom level in the map, used for user location and station position
                    zoom: 13,
                    // how long a station popup to visualize the location should be visible on the map (in msec)
                    stationPopupDuration: 10000,
                    // date/time format which is used on several places
                    dateformat: 'DD.MM.YY HH:mm [h]',
                    shortDateformat: 'DD.MM.YY',
                    // duration after which latest values shall be ignored when rendering marker in the map
                    ignoreAfterDuration: moment.duration(1, 'y'),
                    // default color for circled marker, when last value is older than 'ignoreAfterDuration' or the timeseries has no last value
                    defaultMarkerColor: '#123456',
                    // duration buffer for time series request
                    timeseriesDataBuffer: moment.duration(2, 'h'),
                    // default start time extent
                    defaultStartTimeExtent: {
                        duration: moment.duration(1, 'day'),
                        end: moment().endOf('day')
                    },
                    // default scaling of loaded diagram
                    defaultZeroScale: false,
                    // default grouping timeseries with same uom
                    defaultGroupedAxis: true,
                    // additional parameters which are append to the request urls
                    additionalParameters: {
                        locale: 'de'
                    },
                    // default language for i18n
                    defaultLanguage: 'en',
                    // should saving the status be possible,
                    saveStatusPossible: true,
                    // entries on a page for the values table
                    pagesize: 20,
                    // line width for selected timeseries
                    selectedLineWidth: 5,
                    // common line width for unselected timeseries
                    commonLineWidth: 2,
                    // chart styling options see for more details: https://github.com/flot/flot/blob/master/API.md
                    chartOptions: {},
                    // colorlist to select for a different timeseries color
                    colorList: ['#1abc9c', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50', '#f1c40f',
                        '#d35400', '#c0392b', '#7f8c8d'],
                    // colorlist for the reference values
                    refColorList: [],
                    // select the color from the predefined lists
                    selectColorFromList: false,
                    // interval to display the timeseries in a bar diagram with label and value in hours
                    intervalList: [
                        {label: 'styleChange.barChartInterval.hour', caption: 'byHour', value: 1},
                        {label: 'styleChange.barChartInterval.day', caption: 'byDay', value: 24},
                        {label: 'styleChange.barChartInterval.week', caption: 'byWeek', value: 7 * 24},
                        {label: 'styleChange.barChartInterval.month', caption: 'byMonth', value: 30 * 24}
                    ],
                    timeRangeData: {
                        presets: [
                            {
                                name: 'lastHour',
                                label: 'timeSelection.presets.lastHour',
                                interval: {
                                    from: moment().subtract(1, 'hours'),
                                    till: moment(),
                                    duration: moment.duration(1, 'hours')
                                }
                            },
                            {
                                name: 'today',
                                label: 'timeSelection.presets.today',
                                interval: {
                                    from: moment().startOf('day'),
                                    till: moment().endOf('day'),
                                    duration: moment.duration(1, 'days')
                                }
                            },
                            {
                                name: 'yesterday',
                                label: 'timeSelection.presets.yesterday',
                                interval: {
                                    from: moment().subtract(1, 'days').startOf('day'),
                                    till: moment().subtract(1, 'days').endOf('day'),
                                    duration: moment.duration(1, 'days')
                                }
                            },
                            {
                                name: 'todayYesterday',
                                label: 'timeSelection.presets.todayYesterday',
                                interval: {
                                    from: moment().subtract(1, 'days').startOf('day'),
                                    //till: moment(),
                                    duration: moment.duration(2, 'days')
                                }
                            },
                            {
                                name: 'thisWeek',
                                label: 'timeSelection.presets.thisWeek',
                                interval: {
                                    from: moment().startOf('week'),
                                    //till: moment(),
                                    duration: moment.duration(1, 'weeks')
                                }
                            },
                            {
                                name: 'lastWeek',
                                label: 'timeSelection.presets.lastWeek',
                                interval: {
                                    from: moment().subtract(1, 'weeks').startOf('week'),
                                    till: moment().subtract(1, 'weeks').endOf('week'),
                                    duration: moment.duration(1, 'weeks')
                                }
                            },
                            {
                                name: 'thisMonth',
                                label: 'timeSelection.presets.thisMonth',
                                interval: {
                                    from: moment().startOf('month'),
                                    //till: moment(),
                                    duration: moment.duration(1, 'months')
                                }
                            },
                            {
                                name: 'lastMonth',
                                label: 'timeSelection.presets.lastMonth',
                                interval: {
                                    from: moment().subtract(1, 'months').startOf('month'),
                                    till: moment().subtract(1, 'months').endOf('month'),
                                    duration: moment.duration(1, 'months')
                                }
                            },
                            {
                                name: 'thisYear',
                                label: 'timeSelection.presets.thisYear',
                                interval: {
                                    from: moment().startOf('year'),
                                    //till: moment(),
                                    duration: moment.duration(1, 'years')
                                }
                            },
                            {
                                name: 'lastYear',
                                label: 'timeSelection.presets.lastYear',
                                interval: {
                                    from: moment().subtract(1, 'years').startOf('year'),
                                    till: moment().subtract(1, 'years').endOf('year'),
                                    duration: moment.duration(1, 'years')
                                }
                            }
                        ]
                    },
                    notifyOptions: {
                        position: 'bottom-left',
                        fade_in_speed: 1000,
                        fade_out_speed: 1000,
                        time: 2000
                    },
                    wmsLayer: [],
                    // configuration for the tile layer in the leaflet map (see for more information: http://leafletjs.com/reference.html#tilelayer )
                    tileLayerUrl: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
                    tileLayerOptions: {
                        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    },
                    enableGeoSearch: true,
                    supportedLanguages: [{
                            code: "de",
                            label: "Deutsch"
                        }, {
                            code: "en",
                            label: "English"
                        }
                    ]
                };
                angular.merge(settings, config);
                return settings;
            }]);
angular.module('n52.core.status', ['LocalStorageModule', 'n52.core.settings'])
        .factory('statusService', ['$rootScope', 'localStorageService', 'settingsService', 'permalinkEvaluationService',
            function ($rootScope, localStorageService, settingsService, permalinkEvaluationService) {
                var storageKey = 'status';

                // init default status
                var defStatus = {
                    apiProvider: settingsService.defaultProvider,
                    showLegend: false,
                    showPhenomena: false,
                    saveStatus: settingsService.saveStatus,
                    generalizeData: settingsService.generalizeData,
                    clusterStations: settingsService.clusterStations,
                    concentrationMarker: settingsService.concentrationMarker,
                    timeseries: {},
                    timespan: {}
                };
                defStatus.timespan.duration = settingsService.defaultStartTimeExtent.duration || moment.duration(1, 'day');
                defStatus.timespan.end = settingsService.defaultStartTimeExtent.end || moment();
                defStatus.timespan.start = settingsService.defaultStartTimeExtent.start || moment(defStatus.timespan.end).subtract(defStatus.timespan.duration);

                // set status to rootscope:
                var scope = $rootScope;

                // load status from storage
                var storage = localStorageService.get(storageKey) || {};
                scope.status = angular.extend(angular.copy(defStatus), storage);

                // extend status with possible permalink options
                var permalinkTime = permalinkEvaluationService.getTime();
                if (permalinkTime)
                    scope.status.timespan = permalinkTime;

                var permalinkTimeseries = permalinkEvaluationService.getTimeseries();
                if (permalinkTimeseries)
                    scope.status.timeseries = permalinkTimeseries;

                scope.$watch('status', function (newStatus) {
                    if (newStatus.saveStatus) {
                        localStorageService.set(storageKey, newStatus);
                    } else {
                        localStorageService.remove(storageKey);
                    }
                }, true);

                resetStatus = function () {
                    angular.copy(defStatus, scope.status);
                };

                removeTimeseries = function (internalId) {
                    delete scope.status.timeseries[internalId];
                };

                addTimeseries = function (timeseries) {
                    scope.status.timeseries[timeseries.internalId] = timeseries;
                };

                getTimeseries = function () {
                    return scope.status.timeseries;
                };

                return {
                    resetStatus: resetStatus,
                    addTimeseries: addTimeseries,
                    removeTimeseries: removeTimeseries,
                    getTimeseries: getTimeseries,
                    status: scope.status
                };
            }]);
angular.module('n52.core.styleTs', ['n52.core.color', 'n52.core.time', 'n52.core.interface'])
        .factory('styleService', ['$rootScope', 'settingsService', 'colorService',
            function ($rootScope, settingsService, colorService) {
                var defaultIntervalList = [
                    {label: 'styleChange.barChartInterval.hour', caption: 'byHour', value: 1},
                    {label: 'styleChange.barChartInterval.day', caption: 'byDay', value: 24},
                    {label: 'styleChange.barChartInterval.week', caption: 'byWeek', value: 7 * 24},
                    {label: 'styleChange.barChartInterval.month', caption: 'byMonth', value: 30 * 24}
                ];

                var intervalList = settingsService.intervalList || defaultIntervalList;

                function createStylesInTs(ts) {
                    ts.styles = {};
                    ts.styles.color = ts.renderingHints && ts.renderingHints.properties.color || colorService.getColor(ts.id);
                    ts.styles.visible = true;
                    ts.styles.selected = false;
                    ts.styles.zeroScaled = false;
                    ts.styles.groupedAxis = true;
                    angular.forEach(ts.referenceValues, function (refValue) {
                        refValue.color = colorService.getRefColor(refValue.referenceValueId);
                    });
                }
                
                function deleteStyle(ts) {
                    colorService.removeColor(ts.styles.color);
                    angular.forEach(ts.referenceValues, function (refValue) {
                        colorService.removeRefColor(refValue.color);
                    });
                }

                function toggleSelection(ts) {
                    ts.styles.selected = !ts.styles.selected;
                    $rootScope.$emit('timeseriesChanged', ts.internalId);
                }

                function setSelection(ts, selected, quiet) {
                    ts.styles.selected = selected;
                    if (!quiet) {
                        $rootScope.$emit('timeseriesChanged', ts.internalId);
                    }
                }

                function toggleTimeseriesVisibility(ts) {
                    ts.styles.visible = !ts.styles.visible;
                    $rootScope.$emit('timeseriesChanged', ts.internalId);
                }

                function updateColor(ts, color) {
                    ts.styles.color = color;
                    $rootScope.$emit('timeseriesChanged', ts.internalId);
                }

                function updateZeroScaled(ts) {
                    ts.styles.zeroScaled = !ts.styles.zeroScaled;
                    $rootScope.$emit('timeseriesChanged', ts.internalId);
                }

                function updateGroupAxis(ts) {
                    ts.styles.groupedAxis = !ts.styles.groupedAxis;
                    $rootScope.$emit('timeseriesChanged', ts.internalId);
                }

                function updateInterval(ts, interval) {
                    ts.renderingHints.properties.interval = interval.caption;
                    ts.renderingHints.properties.value = interval.value;
                    $rootScope.$emit('timeseriesChanged', ts.internalId);
                }

                function notifyAllTimeseriesChanged() {
                    $rootScope.$emit('allTimeseriesChanged');
                }

                return {
                    createStylesInTs: createStylesInTs,
                    deleteStyle: deleteStyle,
                    notifyAllTimeseriesChanged: notifyAllTimeseriesChanged,
                    toggleSelection: toggleSelection,
                    setSelection: setSelection,
                    toggleTimeseriesVisibility: toggleTimeseriesVisibility,
                    updateColor: updateColor,
                    updateZeroScaled: updateZeroScaled,
                    updateGroupAxis: updateGroupAxis,
                    updateInterval: updateInterval,
                    intervalList: intervalList
                };
            }]);
angular.module('n52.core.time', ['ngResource', 'n52.core.status'])
        .factory('timeService', ['$rootScope', 'statusService', 'utils', 
            function ($rootScope, statusService, utils) {
                var time = {
                    duration: moment.duration(statusService.status.timespan.duration),
                    start: moment(statusService.status.timespan.start),
                    end: moment(statusService.status.timespan.end)
                };

                function getCurrentTimespan() {
                    return utils.createRequestTimespan(time.start, time.end);
                }

                function setFlexibleTimeExtent(start, end) {
                    time.start = start;
                    time.end = end;
                    time.duration = moment.duration(end.diff(start));
                    fireNewTimeExtent();
                }

                function setPresetInterval(interval) {
                    if (interval.from)
                        time.start = interval.from;
                    if (interval.till)
                        time.end = interval.till;
                    if (interval.duration)
                        time.duration = interval.duration;
                    if (interval.from && interval.duration && !interval.till) {
                        time.end = moment(time.start).add(time.duration);
                    }
                    if (interval.till && interval.duration && !interval.from) {
                        time.start = moment(time.end).subtract(time.duration);
                    }
                    fireNewTimeExtent();
                }

                function stepBack() {
                    time.start = time.start.subtract(time.duration);
                    time.end = time.end.subtract(time.duration);
                    fireNewTimeExtent();
                }

                function stepForward() {
                    time.start = time.start.add(time.duration);
                    time.end = time.end.add(time.duration);
                    fireNewTimeExtent();
                }

                function jumpToLastTimeStamp(timestamp, daylimit) {
                    time.end = moment(timestamp);
                    if (daylimit)
                        time.end.endOf('day');
                    time.start = moment(time.end).subtract(time.duration);
                    fireNewTimeExtent();
                }

                function jumpToFirstTimeStamp(timestamp, daylimit) {
                    time.start = moment(timestamp);
                    if (daylimit)
                        time.start.startOf('day');
                    time.end = moment(time.start).add(time.duration);
                    fireNewTimeExtent();
                }
                
                function centerTimespan (duration) {
                    time.duration = moment.duration(duration);
                    var halfspan = moment.duration(time.duration.valueOf() / 2);
                    var center = (time.end.valueOf() - time.start.valueOf()) / 2;
                    time.start = moment(time.start).add(moment.duration(center)).subtract(halfspan);
                    time.end = moment(time.start).add(time.duration);
                    fireNewTimeExtent();
                }
                
                function isInCurrentTimespan(timestamp) {
                    return moment(timestamp).isBetween(time.start, time.end);
                }

                function fireNewTimeExtent() {
                    statusService.status.timespan = time;
                    $rootScope.$emit('timeExtentChanged');
                }

                return {
                    getCurrentTimespan: getCurrentTimespan,
                    jumpToLastTimeStamp: jumpToLastTimeStamp,
                    jumpToFirstTimeStamp: jumpToFirstTimeStamp,
                    centerTimespan: centerTimespan,
                    setFlexibleTimeExtent: setFlexibleTimeExtent,
                    setPresetInterval: setPresetInterval,
                    isInCurrentTimespan: isInCurrentTimespan,
                    stepBack: stepBack,
                    stepForward: stepForward,
                    time: time
                };
            }]);
angular.module('n52.core.timeseries', ['n52.core.color', 'n52.core.time', 'n52.core.interface', 'n52.core.styleTs'])
        .factory('timeseriesService', ['$rootScope', 'interfaceService', 'statusService', 'timeService', 'styleService',
            function ($rootScope, interfaceService, statusService, timeService, styleService) {
                var timeseries = {};
                var tsData = {};

                // load timeseries from status
                angular.forEach(statusService.getTimeseries(), function (ts) {
                    addTimeseriesById(ts.id, ts.apiUrl);
                });

                $rootScope.$on('timeExtentChanged', function (evt) {
                    _loadAllData();
                });

                function _loadAllData() {
                    // TODO evtl. erst wenn alle Daten da sind soll die Daten auch gesetzt werden???
                    angular.forEach(timeseries, function (ts) {
                        _loadTsData(ts);
                    });
                }

                function _addTs(ts) {
                    styleService.createStylesInTs(ts);
                    timeseries[ts.internalId] = ts;
                    statusService.addTimeseries(ts);
                    _loadTsData(ts);
                }

                function _loadTsData(ts) {
                    ts.loadingData = true;
                    interfaceService.getTsData(ts.id, ts.apiUrl, timeService.getCurrentTimespan()).then(function (data) {
                        _addTsData(data, ts);
                    });
                }

                function _addTsData(data, ts) {
                    tsData[ts.internalId] = data[ts.id];
                    if (tsData[ts.internalId].values && tsData[ts.internalId].values.length) {
                        ts.hasDataInCurrentExtent = false;
                    } else {
                        ts.hasDataInCurrentExtent = true;
                    }
                    $rootScope.$emit('timeseriesDataChanged', ts.internalId);
                    ts.loadingData = false;
                }

                function getData(internalId) {
                    return tsData[internalId];
                }

                function getTimeseries(internalId) {
                    return timeseries[internalId];
                }

                function getAllTimeseries() {
                    return timeseries;
                }

                function hasTimeseries(internalId) {
                    return angular.isObject(timeseries[internalId]);
                }

                function getTimeseriesCount() {
                    return Object.keys(timeseries).length;
                }

                function addTimeseriesById(id, apiUrl, params) {
                    interfaceService.getTimeseries(id, apiUrl, params).then(function (data) {
                        if (angular.isArray(data)) {
                            angular.forEach(data, function (ts) {
                                _addTs(ts, apiUrl);
                            });
                        } else {
                            _addTs(data, apiUrl);
                        }
                    });
                }

                function addTimeseries(ts) {
                    _addTs(angular.copy(ts));
                }

                function removeTimeseries(internalId) {
                    styleService.deleteStyle(timeseries[internalId]);
                    delete timeseries[internalId];
                    delete tsData[internalId];
                    statusService.removeTimeseries(internalId);
                    $rootScope.$emit('timeseriesDataChanged', internalId);
                }

                function removeAllTimeseries() {
                    angular.forEach(timeseries, function (elem) {
                        removeTimeseries(elem.internalId);
                    });
                }

                function toggleReferenceValue(refValue, internalId) {
                    refValue.visible = !refValue.visible;
                    $rootScope.$emit('timeseriesDataChanged', internalId);
                }

                function isTimeseriesVisible(internalId) {
                    return hasTimeseries(internalId) && timeseries[internalId].styles.visible;
                }

                return {
                    addTimeseriesById: addTimeseriesById,
                    addTimeseries: addTimeseries,
                    removeTimeseries: removeTimeseries,
                    removeAllTimeseries: removeAllTimeseries,
                    toggleReferenceValue: toggleReferenceValue,
                    isTimeseriesVisible: isTimeseriesVisible,
                    getData: getData,
                    getTimeseries: getTimeseries,
                    getAllTimeseries: getAllTimeseries,
                    hasTimeseries: hasTimeseries,
                    getTimeseriesCount: getTimeseriesCount,
                    timeseries: timeseries
                };
            }]);
angular.module('n52.core.translate', ['n52.core.permalinkEval'])
        .service('translateService', ['$translate', 'permalinkEvaluationService', function ($translate, permalinkEvaluationService) {
                var lang = permalinkEvaluationService.getParam('lang');
                if(angular.isString(lang)) {
                    $translate.use(lang);
                }

                return {
                };
            }]);
angular.module('n52.core.utils', ['n52.core.settings'])
        .factory('utils', ['$window', 'settingsService',
            function ($window, settingsService) {
                function isFileAPISupported() {
                    var isIOS = $window.navigator.userAgent.match(/(iPad|iPhone|iPod)/g) !== null;
                    return ($window.File && $window.FileReader && $window.Blob) && !isIOS;
                }

                function createInternalId(tsId, apiUrl) {
                    return settingsService.restApiUrls[apiUrl] + "__" + tsId;
                }

                function createRequestTimespan(start, end) {
                    return moment(start).format() + "/" + moment(end).format();
                }

                function getTimeseriesCombinationByInternalId(internalId) {
                    var combination = {};
                    angular.forEach(settingsService.restApiUrls, function (apiID, url) {
                        if (internalId.indexOf(apiID) === 0) {
                            combination = {
                                id: internalId.substring(internalId.indexOf('__') + 2, internalId.length),
                                apiUrl: url
                            };
                        }
                    });
                    return combination;
                }

                return {
                    createRequestTimespan: createRequestTimespan,
                    getTimeseriesCombinationByInternalId: getTimeseriesCombinationByInternalId,
                    createInternalId: createInternalId,
                    isFileAPISupported: isFileAPISupported
                };
            }]);