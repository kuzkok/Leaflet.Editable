L.Editable.PolylineEditor = L.Editable.PathEditor.extend({

    startDrawingBackward: function () {
        this._drawing = L.Editable.BACKWARD;
        this.startDrawing();
    },

    continueBackward: function (latlngs) {
        if (this.drawing()) return;
        latlngs = latlngs || this.getDefaultLatLngs();
        this.setDrawnLatLngs(latlngs);
        if (latlngs.length > 0) {
            this.tools.attachBackwardLineGuide();
            this.tools.anchorBackwardLineGuide(latlngs[0]);
        }
        this.startDrawingBackward();
    },

    continueForward: function (latlngs) {
        if (this.drawing()) return;
        latlngs = latlngs || this.getDefaultLatLngs();
        this.setDrawnLatLngs(latlngs);
        if (latlngs.length > 0) {
            this.tools.attachForwardLineGuide();
            this.tools.anchorForwardLineGuide(latlngs[latlngs.length - 1]);
        }
        this.startDrawingForward();
    },

    getDefaultLatLngs: function (latlngs) {
        latlngs = latlngs || this.feature._latlngs;
        if (!latlngs.length || latlngs[0] instanceof L.LatLng) return latlngs;
        else return this.getDefaultLatLngs(latlngs[0]);
    },

    ensureMulti: function () {
        if (this.feature._latlngs.length && L.Polyline._flat(this.feature._latlngs)) {
            this.feature._latlngs = [this.feature._latlngs];
        }
    },

    addNewEmptyShape: function () {
        if (this.feature._latlngs.length) {
            var shape = [];
            this.appendShape(shape);
            return shape;
        } else {
            return this.feature._latlngs;
        }
    },

    formatShape: function (shape) {
        if (L.Polyline._flat(shape)) return shape;
        else if (shape[0]) return this.formatShape(shape[0]);
    },

    splitShape: function (shape, index) {
        if (!index || index >= shape.length - 1) return;
        this.ensureMulti();
        var shapeIndex = this.feature._latlngs.indexOf(shape);
        if (shapeIndex === -1) return;
        var first = shape.slice(0, index + 1),
            second = shape.slice(index);
        // We deal with reference, we don't want twice the same latlng around.
        second[0] = L.latLng(second[0].lat, second[0].lng, second[0].alt);
        this.feature._latlngs.splice(shapeIndex, 1, first, second);
        this.refresh();
        this.reset();
    }

});
