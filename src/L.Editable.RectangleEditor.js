L.Editable.RectangleEditor = L.Editable.PathEditor.extend({

    CLOSED: true,
    MIN_VERTEX: 4,

    _initialLatLng: null,

    options: {
        skipMiddleMarkers: true
    },

    extendBounds: function (e) {
        var index = e.vertex.getIndex(),
            indexAfter = (index + 1) % 4,
            indexBefore = (index + 3) % 4,
            oppositeIndex = (index + 2) % 4,
            opposite = e.vertex.latlngs[oppositeIndex],
            latlngs = this.getDefaultLatLngs(),
            bounds = new L.LatLngBounds(e.latlng, opposite);

        // Instead of calling updateBounds method, we'll take care of
        // udpating bounds and lat lngs here, since the updateBounds
        // method can change the order of vertices if you drag a vertex
        // across one of the rectangle edges.  We need the order to
        // stay the same since we don't want to handle switching which
        // vertex we are dragging mid drag.

        this.feature._bounds = bounds;

        // The lat lng for the index we are dragging is just the event
        // lat lng, note that the corner opposite of the vertex we are
        // dragging doesn't change, so we don't update it
        latlngs[index].update(e.latlng);

        // Set the lat lng for the vertices before and after the vertex
        // that is being dragged.  Basically the lat from the vertex being
        // dragged and the lng from the opposite vertex, and vice versa for
        // the vertex on the other side (to make the rectangle shape).
        latlngs[indexAfter].update(new L.LatLng(e.latlng.lat, opposite.lng));
        latlngs[indexBefore].update(new L.LatLng(opposite.lat, e.latlng.lng));

        this.refreshVertexMarkers();
    },

    onDrawingMouseMove: function (e) {
        L.Editable.PathEditor.prototype.onDrawingMouseMove.call(this, e);

        if (this._initialLatLng) {
            var bounds = new L.LatLngBounds(this._initialLatLng, e.latlng);
            this.updateBounds(bounds);
            this.refresh();
            this.reset();
        }
    },

    onDrawingMouseDown: function (e) {
        L.Editable.PathEditor.prototype.onDrawingMouseDown.call(this, e);

        if (!this._initialLatLng) {

            // must make a copy of the event lat lng, as that instance will
            // get updated since we push it to the latlngs array
            this._initialLatLng = L.latLng(e.latlng.lat, e.latlng.lng);

            var latlngs = this.getDefaultLatLngs();

            // L.Polygon._convertLatLngs removes last latlng if it equals first point,
            // which is the case here as all latlngs are [0, 0]
            if (latlngs.length === 3) latlngs.push(e.latlng);

            this.connect();

            var bounds = new L.LatLngBounds(e.latlng, e.latlng);
            this.updateBounds(bounds);
            this.refresh();
            this.reset();
        }

        // Stop map dragging, need to wait a tick before firing the onUp event
        // for the map dragging, as it may not have started dragging yet
        var map = this.map;
        setTimeout(function () {
            map.dragging._draggable._onUp(e.originalEvent);
        });
    },

    onDrawingMouseUp: function (e) {
        L.Editable.PathEditor.prototype.onDrawingMouseUp.call(this, e);

        if (this._initialLatLng) {
            this._initialLatLng = null;
            this.commitDrawing(e);
        }
    },

    getDefaultLatLngs: function (latlngs) {
        return latlngs || this.feature._latlngs[0];
    },

    updateBounds: function (bounds) {
        this.feature._bounds = bounds;
        var latlngs = this.getDefaultLatLngs(),
            newLatlngs = this.feature._boundsToLatLngs(bounds);

        // Keep references.
        for (var i = 0; i < latlngs.length; i++) {
            latlngs[i].update(newLatlngs[i]);
        }
    }
});
