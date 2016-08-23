L.Editable.include({
    startPolyline: function (latlng, options) {
        var line = this.createPolyline([], options);
        line.enableEdit(this.map).newShape(latlng);
        return line;
    },

    startPolygon: function (latlng, options) {
        var polygon = this.createPolygon([], options);
        polygon.enableEdit(this.map).newShape(latlng);
        return polygon;
    },

    startMarker: function (latlng, options) {
        latlng = latlng || this.map.getCenter().clone();
        var marker = this.createMarker(latlng, options);
        marker.enableEdit(this.map).startDrawing();
        return marker;
    },

    startRectangle: function (latlng, options) {
        var corner = latlng || L.latLng([0, 0]);
        var bounds = new L.LatLngBounds(corner, corner);
        var rectangle = this.createRectangle(bounds, options);
        rectangle.enableEdit(this.map).startDrawing();
        return rectangle;
    },

    startCircle: function (latlng, options) {
        latlng = latlng || this.map.getCenter().clone();
        var circle = this.createCircle(latlng, options);
        circle.enableEdit(this.map).startDrawing();
        return circle;
    },

    startHole: function (editor, latlng) {
        editor.newHole(latlng);
    }
})
