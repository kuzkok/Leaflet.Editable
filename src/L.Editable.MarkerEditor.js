L.Editable.MarkerEditor = L.Editable.BaseEditor.extend({

    onDrawingMouseMove: function (e) {
        L.Editable.BaseEditor.prototype.onDrawingMouseMove.call(this, e);
        if (this._drawing) this.feature.setLatLng(e.latlng);
    },

    processDrawingClick: function (e) {
        this.fireAndForward('editable:drawing:clicked', e);
        this.commitDrawing(e);
    },

    connect: function (e) {
        // On touch, the latlng has not been updated because there is
        // no mousemove.
        if (e) this.feature._latlng = e.latlng;
        L.Editable.BaseEditor.prototype.connect.call(this, e);
    },

    _onDrag: function (e) {
        this.onMove(e);
        L.Editable.BaseEditor.prototype._onDrag.call(this, e);
    }

});
