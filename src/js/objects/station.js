function Station(props, geometry) {
    this.properties = props;
    this.geometry = geometry;
    this.getId = function() {
        return this.properties.id;
    };
}