L.Polyline.include({

    getEditorClass: function (map) {
        return (map && map.options.polylineEditorClass) ? map.options.polylineEditorClass : L.Editable.PolylineEditor;
    },

    shapeAt: function (latlng, latlngs) {
        // We can have those cases:
        // - latlngs are just a flat array of latlngs, use this
        // - latlngs is an array of arrays of latlngs, loop over
        var shape = null;
        latlngs = latlngs || this._latlngs;
        if (!latlngs.length) return shape;
        else if (L.Polyline._flat(latlngs) && this.isInLatLngs(latlng, latlngs)) shape = latlngs;
        else for (var i = 0; i < latlngs.length; i++) if (this.isInLatLngs(latlng, latlngs[i])) return latlngs[i];
        return shape;
    },

    isInLatLngs: function (l, latlngs) {
        if (!latlngs) return false;
        var i, k, len, part = [], p,
            w = this._clickTolerance();
        this._projectLatlngs(latlngs, part, this._pxBounds);
        part = part[0];
        p = this._map.latLngToLayerPoint(l);

        if (!this._pxBounds.contains(p)) { return false; }
        for (i = 1, len = part.length, k = 0; i < len; k = i++) {

            if (L.LineUtil.pointToSegmentDistance(p, part[k], part[i]) <= w) {
                return true;
            }
        }
        return false;
    }

});
