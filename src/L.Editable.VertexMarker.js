L.Editable.VertexMarker = L.Marker.extend({

    options: {
        draggable: true,
        className: 'leaflet-div-icon leaflet-vertex-icon'
    },

    initialize: function (latlng, latlngs, editor, options) {
        // We don't use this._latlng, because on drag Leaflet replace it while
        // we want to keep reference.
        this.latlng = latlng;
        this.latlngs = latlngs;
        this.editor = editor;
        L.Marker.prototype.initialize.call(this, latlng, options);
        this.options.icon = this.editor.tools.createVertexIcon({ className: this.options.className });
        this.latlng.__vertex = this;
        this.editor.editLayer.addLayer(this);
        this.setZIndexOffset(editor.tools._lastZIndex + 1);
    },

    onAdd: function (map) {
        L.Marker.prototype.onAdd.call(this, map);
        this.on('drag', this.onDrag);
        this.on('dragstart', this.onDragStart);
        this.on('dragend', this.onDragEnd);
        this.on('mouseup', this.onMouseup);
        this.on('click', this.onClick);
        this.on('contextmenu', this.onContextMenu);
        this.on('mousedown touchstart', this.onMouseDown);
        this.addMiddleMarkers();
    },

    onRemove: function (map) {
        if (this.middleMarker) this.middleMarker.delete();
        delete this.latlng.__vertex;
        this.off('drag', this.onDrag);
        this.off('dragstart', this.onDragStart);
        this.off('dragend', this.onDragEnd);
        this.off('mouseup', this.onMouseup);
        this.off('click', this.onClick);
        this.off('contextmenu', this.onContextMenu);
        this.off('mousedown touchstart', this.onMouseDown);
        L.Marker.prototype.onRemove.call(this, map);
    },

    onDrag: function (e) {
        e.vertex = this;
        this.editor.onVertexMarkerDrag(e);
        var iconPos = L.DomUtil.getPosition(this._icon),
            latlng = this._map.layerPointToLatLng(iconPos);
        this.latlng.update(latlng);
        this._latlng = this.latlng;  // Push back to Leaflet our reference.
        this.editor.refresh();
        if (this.middleMarker) {
            this.middleMarker.updateLatLng();
        }
        var next = this.getNext();
        if (next && next.middleMarker) {
            next.middleMarker.updateLatLng();
        }
    },

    onDragStart: function (e) {
        e.vertex = this;
        this.editor.onVertexMarkerDragStart(e);
    },

    onDragEnd: function (e) {
        e.vertex = this;
        this.editor.onVertexMarkerDragEnd(e);
    },

    onClick: function (e) {
        e.vertex = this;
        this.editor.onVertexMarkerClick(e);
    },

    onMouseup: function (e) {
        L.DomEvent.stop(e);
        e.vertex = this;
        this.editor.map.fire('mouseup', e);
    },

    onContextMenu: function (e) {
        e.vertex = this;
        this.editor.onVertexMarkerContextMenu(e);
    },

    onMouseDown: function (e) {
        e.vertex = this;
        this.editor.onVertexMarkerMouseDown(e);
    },

    delete: function () {
        var next = this.getNext();  // Compute before changing latlng
        this.latlngs.splice(this.getIndex(), 1);
        this.editor.editLayer.removeLayer(this);
        this.editor.onVertexDeleted({ latlng: this.latlng, vertex: this });
        if (!this.latlngs.length) this.editor.deleteShape(this.latlngs);
        if (next) next.resetMiddleMarker();
        this.editor.refresh();
    },

    getIndex: function () {
        return this.latlngs.indexOf(this.latlng);
    },

    getLastIndex: function () {
        return this.latlngs.length - 1;
    },

    getPrevious: function () {
        if (this.latlngs.length < 2) return;
        var index = this.getIndex(),
            previousIndex = index - 1;
        if (index === 0 && this.editor.CLOSED) previousIndex = this.getLastIndex();
        var previous = this.latlngs[previousIndex];
        if (previous) return previous.__vertex;
    },

    getNext: function () {
        if (this.latlngs.length < 2) return;
        var index = this.getIndex(),
            nextIndex = index + 1;
        if (index === this.getLastIndex() && this.editor.CLOSED) nextIndex = 0;
        var next = this.latlngs[nextIndex];
        if (next) return next.__vertex;
    },

    addMiddleMarker: function (previous) {
        if (!this.editor.hasMiddleMarkers()) return;
        previous = previous || this.getPrevious();
        if (previous && !this.middleMarker) this.middleMarker = this.editor.addMiddleMarker(previous, this, this.latlngs, this.editor);
    },

    addMiddleMarkers: function () {
        if (!this.editor.hasMiddleMarkers()) return;
        var previous = this.getPrevious();
        if (previous) {
            this.addMiddleMarker(previous);
        }
        var next = this.getNext();
        if (next) {
            next.resetMiddleMarker();
        }
    },

    resetMiddleMarker: function () {
        if (this.middleMarker) this.middleMarker.delete();
        this.addMiddleMarker();
    },

    split: function () {
        if (!this.editor.splitShape) return;  // Only for PolylineEditor
        this.editor.splitShape(this.latlngs, this.getIndex());
    },

    continue: function () {
        if (!this.editor.continueBackward) return;  // Only for PolylineEditor
        var index = this.getIndex();
        if (index === 0) this.editor.continueBackward(this.latlngs);
        else if (index === this.getLastIndex()) this.editor.continueForward(this.latlngs);
    }

});

L.Editable.mergeOptions({
    vertexMarkerClass: L.Editable.VertexMarker
});
