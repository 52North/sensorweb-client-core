
# Configuration

The following configuration parameters are available:

### `defaultProvider`

```json
"defaultProvider": {
    "serviceID": "srv_3dec8ce040d9506c5aba685c9d134156",
    "url": "http://sensorweb.demo.52north.org/sensorwebclient-webapp-stable/api/v1/"
}
```

The default selected provider to show stations in the map.

### `restApiUrls`

```json
"restApiUrls": {
    "http://sensorweb.demo.52north.org/sensorwebclient-webapp-stable/api/v1/": "52nSensorweb",
    "http://sensorweb.demo.52north.org/sensorwebtestbed/api/v1/": "52nSensorwebTestbed",
}
```

A list of timeseries-API urls and an appropriate identifier to create internal timeseries ids.

### `supportedLanguages`

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

### `baselayer`

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

### `overlay`

```json
"overlay": {
}
```

Same effect as the baselayer configuration.

### `showScale`

```json
"showScale": true
```

Show the scale bar in the map.

### `commonLineWidth`

```json
"commonLineWidth": 1
```

Common line width of a timeseries in the chart.

### `selectedLineWidth`

```json
"selectedLineWidth": 4,
```

Line width of a selected timeseries in the chart.