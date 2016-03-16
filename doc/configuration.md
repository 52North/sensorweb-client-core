
# Configuration

The following configuration parameters are available:

## General

#####`defaultProvider`

```json
"defaultProvider": {
    "serviceID": "srv_3dec8ce040d9506c5aba685c9d134156",
    "url": "http://sensorweb.demo.52north.org/sensorwebclient-webapp-stable/api/v1/"
}
```

The default selected provider to show stations in the map.

#####`providerBlackList`

```json
"providerBlackList": [
        {
            "serviceID": "id",
            "apiUrl": "http://sensorweb.demo.52north.org/sensorwebclient-webapp-stable/api/v1/"
        }
    ]
```

The provider in this list will be removed from the provider list offered to the user.

#####`restApiUrls`

```json
"restApiUrls": {
    "http://sensorweb.demo.52north.org/sensorwebclient-webapp-stable/api/v1/": "52nSensorweb",
    "http://sensorweb.demo.52north.org/sensorwebtestbed/api/v1/": "52nSensorwebTestbed",
}
```

A list of timeseries-API urls and an appropriate identifier to create internal timeseries ids.

#####`supportedLanguages`

```json
"supportedLanguages": [{
        "code": "de",
        "label": "Deutsch"
    }, {
        "code": "en",
        "label": "english"
    }
]
```

These are the supported languages in the client. For every language there must exist a translation file in the i18n folder.

#####`dateFormat`

```json
"dateFormat": "DD.MM.YY HH:mm [h]"
```

Date/time format which is used on several places.

#####`additionalParameters`

```json
"additionalParameters": {
    "locale" : "de"
}
```

Additional parameters which are append to the requests to the API.

#####`colorList`

```json
"colorList": [
        "#FF783D",
        "#E22985",
        "#8D00A9"
    ]
```

Colorlist to select for a different timeseries color.

#####`refColorList`

```json
"refColorList": [
        "#FF783D",
        "#E22985",
        "#8D00A9"
    ]
```

Colorlist for the reference values, similiar to the `colorList`

#####`selectColorFromList`

```json
"selectColorFromList": true
```

Select the color from the predefined lists

#####`undefinedUomString`

```json
"undefinedUomString": "-"
```

Hides the uom if it matches the defined parameter.

#####`showLegendOnStartup`

```json
"showLegendOnStartup": true
```

Parameter to collapse the legend.

#####`showPhenomenaListOnStartup`

```json
"showPhenomenaListOnStartup": true
```

Parameter to collapse the phenomena list.

#####`saveStatus`

```json
"saveStatus": true
```

Save the status

#####`generalizeData`

```json
"generalizeData": true
```

Requests generalized timeseries data when this parameter is set.


## Map

#####`baselayer`

```json
"baselayer": {
    "mapbox": {
        "name": "Mapbox",
        "type": "xyz",
        "url": "http://otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg",
        "layerOptions": {
            "attribution": "&copy; <a href='http://www.mapquest.com/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png'/>"
        }
    }
}
```

All configured baselayer can be selected in the map.

#####`overlays`

```json
"overlays": {
}
```

Same effect as the `baselayer` configuration.

#####`showScale`

```json
"showScale": true
```

Show the scale bar in the map.

#####`locateIconOptions`

```json
"locateIconOptions": {
    "iconUrl": "images/location.png",
    "iconRetinaUrl": "images/location@2x.png",
    "iconSize": [
        43,
        43
    ],
    "iconAnchor": [
        21,
        21
    ]
}
```

Location marker, when using the locate functionality. See [here] (http://leafletjs.com/reference.html#icon) for more informations.


#####`searchResultIconOptions`

Marker to show the search result in the map. Same as `locateIconOptions`

#####`stationIconOptions`

Marker to represent a station on the map. Same as `locateIconOptions`

#####`defaultMarkerColor`

```json
"defaultMarkerColor": "#123456"
```

Default color for circled marker, if last value is not set.

#####`clusterStations`

```json
"clusterStations": true
```

Cluster the stations shown on the map.

## Chart

#####`chartOptions`

```json
"chartOptions": {}
```

Chart styling options see for more details: https://github.com/flot/flot/blob/master/API.md     

#####`commonLineWidth`

```json
"commonLineWidth": 1
```

Common line width of a timeseries in the chart.

#####`selectedLineWidth`

```json
"selectedLineWidth": 4,
```

Line width of a selected timeseries in the chart.

#####`activeLineWidth`

```json
"activeLineWidth": 3,
```

Line width of an active timeseries in the chart.

## Overview chart

#####`overviewChartOptions`

```json
"overviewChartOptions": {}
```

Overview chart styling options see for more details: https://github.com/flot/flot/blob/master/API.md
