## Content
This is a newer version of the client described [here](http://blog.52north.org/2015/04/13/52north-javascript-sos-client-1-0-official-release/). We decided to use AngularJS for the client to support a more modular and the better customizable way to develop a sensor web client.

This repository comprises the core functionalities as all services, which handles the background tasks like:

* communication with the [API] (https://github.com/52North/sensorweb-rest-api)
* managing the loaded and used timeseries
* handling the saved favorites
* drawing the chart and the overview diagram
* managing the permalink creation and evaluation

To create a complete runnable client use the [sensorweb-thin-client] (https://github.com/52North/sensorweb-thin-client) repository or use your own one.

## How to develop

To develop the core and frontend components parallel you should do the following steps: 

 * clone both repositories and do a `bower install` for both repositories ([this] (https://github.com/52North/sensorweb-client-core) and [sensorweb-thin-client] (https://github.com/52North/sensorweb-thin-client)) to get the needed dependencies
 * call `bower link` in the `sensorweb-client-core` folder to create a symbolic link to this repository in your home folder 
 * now add the created link in your `sensorweb-thin-client` folder with the command `bower link n52-sensorweb-client-core`

Got the inspiration [here] (https://oncletom.io/2013/live-development-bower-component/)

## Configuration

[here] (doc/configuration.md) you get a list of configuration parameters

## License

Licensed under Apache License 2.0