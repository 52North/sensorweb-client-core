function Timeseries(internalId, url) {
    this.internalId = internalId; 
    this.apiUrl = url;
    this.getStationLabel = function() {
        if (this.station) {
            return this.station.properties.label;
        } else {
            return this.parameters.platform.label;
        }
    };
}