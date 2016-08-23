L.Editable.PolygonEditor = L.Editable.PathEditor.extend({

    CLOSED: true,
    MIN_VERTEX: 3,

    newPointForward: function (latlng) {
        L.Editable.PathEditor.prototype.newPointForward.call(this, latlng);
        if (!this.tools.backwardLineGuide._latlngs.length) this.tools.anchorBackwardLineGuide(latlng);
        if (this._drawnLatLngs.length === 2) this.tools.attachBackwardLineGuide();
    },

    addNewEmptyHole: function (latlng) {
        this.ensureNotFlat();
        var latlngs = this.feature.shapeAt(latlng);
        if (!latlngs) return;
        var holes = [];
        latlngs.push(holes);
        return holes;
    },

    newHole: function (latlng) {
        var holes = this.addNewEmptyHole(latlng);
        if (!holes) return;
        this.setDrawnLatLngs(holes);
        this.startDrawingForward();
        if (latlng) this.newPointForward(latlng);
    },

    addNewEmptyShape: function () {
        if (this.feature._latlngs.length && this.feature._latlngs[0].length) {
            var shape = [];
            this.appendShape(shape);
            return shape;
        } else {
            return this.feature._latlngs;
        }
    },

    ensureMulti: function () {
        if (this.feature._latlngs.length && L.Polyline._flat(this.feature._latlngs[0])) {
            this.feature._latlngs = [this.feature._latlngs];
        }
    },

    ensureNotFlat: function () {
        if (!this.feature._latlngs.length || L.Polyline._flat(this.feature._latlngs)) this.feature._latlngs = [this.feature._latlngs];
    },

    vertexCanBeDeleted: function (vertex) {
        var parent = this.feature.parentShape(vertex.latlngs),
            idx = L.Util.indexOf(parent, vertex.latlngs);
        if (idx > 0) return true;  // Holes can be totally deleted without removing the layer itself.
        return L.Editable.PathEditor.prototype.vertexCanBeDeleted.call(this, vertex);
    },

    getDefaultLatLngs: function () {
        if (!this.feature._latlngs.length) this.feature._latlngs.push([]);
        return this.feature._latlngs[0];
    },

    formatShape: function (shape) {
        // [[1, 2], [3, 4]] => must be nested
        // [] => must be nested
        // [[]] => is already nested
        if (L.Polyline._flat(shape) && (!shape[0] || shape[0].length !== 0)) return [shape];
        else return shape;
    }

});
