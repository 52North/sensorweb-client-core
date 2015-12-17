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
                    // A list of timeseries-API urls and an appropriate identifier to create internal timeseries ids - should be defined in the settings.json
                    restApiUrls: {
//                        'http://sensorweb.demo.52north.org/sensorwebclient-webapp-stable/api/v1/': '52nSensorweb',
//                        'http://sosrest.irceline.be/api/v1/': 'irceline',
//                        'http://www.fluggs.de/sos2/api/v1/': 'fluggs'
//                        'http://sensors.geonovum.nl/sos/api/v1/': 'geonovum'
                    },
                    // default selected provider
                    defaultProvider: {
//                        serviceID: 'srv_738111ed219f738cfc85be0c8d87843c',
//                        url: 'http://sensorweb.demo.52north.org/sensorwebclient-webapp-stable/api/v1/'
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
                                    till: moment().endOf('day'),
                                    duration: moment.duration(2, 'days')
                                }
                            },
                            {
                                name: 'thisWeek',
                                label: 'timeSelection.presets.thisWeek',
                                interval: {
                                    from: moment().startOf('week'),
                                    till: moment().endOf('week'),
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
                                    till: moment().endOf('month'),
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
                                    till: moment().endOf('year'),
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