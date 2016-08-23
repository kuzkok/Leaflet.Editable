L.Editable.CircleEditor = L.Editable.PathEditor.extend({

    MIN_VERTEX: 2,

    _started: false,

    options: {
        skipMiddleMarkers: true
    },

    initialize: function (map, feature, options) {
        L.Editable.PathEditor.prototype.initialize.call(this, map, feature, options);
        this._resizeLatLng = this.computeResizeLatLng();
    },

    computeResizeLatLng: function () {
        // While circle is not added to the map, _radius is not set.
        var delta = (this.feature._radius || this.feature._mRadius) * Math.cos(Math.PI / 4),
            point = this.map.project(this.feature._latlng);
        return this.map.unproject([point.x + delta, point.y - delta]);
    },

    updateResizeLatLng: function (latlng) {
        this._resizeLatLng.update(latlng);
        this._resizeLatLng.__vertex.update();
    },

    getLatLngs: function () {
        return [this.feature._latlng, this._resizeLatLng];
    },

    getDefaultLatLngs: function () {
        return this.getLatLngs();
    },

    onVertexMarkerDrag: function (e) {
        if (e.vertex.getIndex() === 1) this.resize(e);
        else this.updateResizeLatLng(this.computeResizeLatLng());
        L.Editable.PathEditor.prototype.onVertexMarkerDrag.call(this, e);
    },

    resize: function (e) {
        var radius = this.feature._latlng.distanceTo(e.latlng);
        this.feature.setRadius(radius);
        this.updateResizeLatLng(e.latlng);
    },

    onDrawingMouseDown: function (e) {
        L.Editable.PathEditor.prototype.onDrawingMouseDown.call(this, e);

        if (!this._started) {
            this._started = true;

            this.feature._latlng.update(e.latlng);
            this.connect();
            this.resize(e);
        }

        // Stop map dragging, need to wait a tick before firing the onUp event
        // for the map dragging, as it may not have started dragging yet
        var map = this.map;
        setTimeout(function () {
            map.dragging._draggable._onUp(e.originalEvent);
        });
    },

    onDrawingMouseMove: function (e) {
        L.Editable.BaseEditor.prototype.onDrawingMouseMove.call(this, e);
        this.resize(e);
    },

    onDrawingMouseUp: function (e) {
        L.Editable.BaseEditor.prototype.onDrawingMouseUp.call(this, e);

        if (this._started) {
            this._started = false;
            this.commitDrawing(e);
        }
    },

    // This method is fired if the circle is dragged by clicking a
    // shaded part of the circle and dragging (not by vertex).  In
    // that scenario we need to make sure we update the vertex that
    // is used for resizing the circle, so that it is still on the
    // edge of the circle.
    _onDrag: function (e) {
        L.Editable.PathEditor.prototype._onDrag.call(this, e);
        this.feature.dragging.updateLatLng(this._resizeLatLng);
    }
});
