L.Polygon.include({

    getEditorClass: function (map) {
        return (map && map.options.polygonEditorClass) ? map.options.polygonEditorClass : L.Editable.PolygonEditor;
    },

    shapeAt: function (latlng, latlngs) {
        // We can have those cases:
        // - latlngs are just a flat array of latlngs, use this
        // - latlngs is an array of arrays of latlngs, this is a simple polygon (maybe with holes), use the first
        // - latlngs is an array of arrays of arrays, this is a multi, loop over
        var shape = null;
        latlngs = latlngs || this._latlngs;
        if (!latlngs.length) return shape;
        else if (L.Polyline._flat(latlngs) && this.isInLatLngs(latlng, latlngs)) shape = latlngs;
        else if (L.Polyline._flat(latlngs[0]) && this.isInLatLngs(latlng, latlngs[0])) shape = latlngs;
        else for (var i = 0; i < latlngs.length; i++) if (this.isInLatLngs(latlng, latlngs[i][0])) return latlngs[i];
        return shape;
    },

    isInLatLngs: function (l, latlngs) {
        var inside = false, l1, l2, j, k, len2;

        for (j = 0, len2 = latlngs.length, k = len2 - 1; j < len2; k = j++) {
            l1 = latlngs[j];
            l2 = latlngs[k];

            if (((l1.lat > l.lat) !== (l2.lat > l.lat)) &&
                (l.lng < (l2.lng - l1.lng) * (l.lat - l1.lat) / (l2.lat - l1.lat) + l1.lng)) {
                inside = !inside;
            }
        }

        return inside;
    },

    parentShape: function (shape, latlngs) {
        latlngs = latlngs || this._latlngs;
        if (!latlngs) return;
        var idx = L.Util.indexOf(latlngs, shape);
        if (idx !== -1) return latlngs;
        for (var i = 0; i < latlngs.length; i++) {
            idx = L.Util.indexOf(latlngs[i], shape);
            if (idx !== -1) return latlngs[i];
        }
    }

});
