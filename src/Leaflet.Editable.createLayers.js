L.Editable.include({
    createLayer: function (klass, latlngs, options) {
        options = L.Util.extend({ editOptions: { editTools: this } }, options);
        var layer = new klass(latlngs, options);
        this.fireAndForward('editable:created', { layer: layer });
        return layer;
    },

    createPolyline: function (latlngs, options) {
        return this.createLayer(options && options.polylineClass || this.options.polylineClass, latlngs, options);
    },

    createPolygon: function (latlngs, options) {
        return this.createLayer(options && options.polygonClass || this.options.polygonClass, latlngs, options);
    },

    createMarker: function (latlng, options) {
        return this.createLayer(options && options.markerClass || this.options.markerClass, latlng, options);
    },

    createRectangle: function (bounds, options) {
        return this.createLayer(options && options.rectangleClass || this.options.rectangleClass, bounds, options);
    },

    createCircle: function (latlng, options) {
        return this.createLayer(options && options.circleClass || this.options.circleClass, latlng, options);
    }
})
