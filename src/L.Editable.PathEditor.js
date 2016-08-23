L.Editable.PathEditor = L.Editable.BaseEditor.extend({

    CLOSED: false,
    MIN_VERTEX: 2,

    addHooks: function () {
        L.Editable.BaseEditor.prototype.addHooks.call(this);
        if (this.feature) this.initVertexMarkers();
        return this;
    },

    initVertexMarkers: function (latlngs) {
        if (!this.enabled()) return;
        latlngs = latlngs || this.getLatLngs();
        if (L.Polyline._flat(latlngs)) this.addVertexMarkers(latlngs);
        else for (var i = 0; i < latlngs.length; i++) this.initVertexMarkers(latlngs[i]);
    },

    getLatLngs: function () {
        return this.feature.getLatLngs();
    },

    reset: function () {
        this.editLayer.clearLayers();
        this.initVertexMarkers();
    },

    addVertexMarker: function (latlng, latlngs) {
        return new this.tools.options.vertexMarkerClass(latlng, latlngs, this);
    },

    addVertexMarkers: function (latlngs) {
        for (var i = 0; i < latlngs.length; i++) {
            this.addVertexMarker(latlngs[i], latlngs);
        }
    },

    refreshVertexMarkers: function (latlngs) {
        latlngs = latlngs || this.getDefaultLatLngs();
        for (var i = 0; i < latlngs.length; i++) {
            latlngs[i].__vertex.update();
        }
    },

    addMiddleMarker: function (left, right, latlngs) {
        return new this.tools.options.middleMarkerClass(left, right, latlngs, this);
    },

    onVertexMarkerClick: function (e) {
        L.Editable.makeCancellable(e);
        this.fireAndForward('editable:vertex:click', e);
        if (e._cancelled) return;
        if (this.tools.drawing() && this.tools._drawingEditor !== this) return;
        var index = e.vertex.getIndex(), commit;
        if (e.originalEvent.ctrlKey) {
            this.onVertexMarkerCtrlClick(e);
        } else if (e.originalEvent.altKey) {
            this.onVertexMarkerAltClick(e);
        } else if (e.originalEvent.shiftKey) {
            this.onVertexMarkerShiftClick(e);
        } else if (e.originalEvent.metaKey) {
            this.onVertexMarkerMetaKeyClick(e);
        } else if (index === e.vertex.getLastIndex() && this._drawing === L.Editable.FORWARD) {
            if (index >= this.MIN_VERTEX - 1) commit = true;
        } else if (index === 0 && this._drawing === L.Editable.BACKWARD && this._drawnLatLngs.length >= this.MIN_VERTEX) {
            commit = true;
        } else if (index === 0 && this._drawing === L.Editable.FORWARD && this._drawnLatLngs.length >= this.MIN_VERTEX && this.CLOSED) {
            commit = true;  // Allow to close on first point also for polygons
        } else {
            this.onVertexRawMarkerClick(e);
        }
        this.fireAndForward('editable:vertex:clicked', e);
        if (commit) this.commitDrawing(e);
    },

    onVertexRawMarkerClick: function (e) {
        this.fireAndForward('editable:vertex:rawclick', e);
        if (e._cancelled) return;
        if (!this.vertexCanBeDeleted(e.vertex)) return;
        e.vertex.delete();
    },

    vertexCanBeDeleted: function (vertex) {
        return vertex.latlngs.length > this.MIN_VERTEX;
    },

    onVertexDeleted: function (e) {
        this.fireAndForward('editable:vertex:deleted', e);
    },

    onVertexMarkerCtrlClick: function (e) {
        this.fireAndForward('editable:vertex:ctrlclick', e);
    },

    onVertexMarkerShiftClick: function (e) {
        this.fireAndForward('editable:vertex:shiftclick', e);
    },

    onVertexMarkerMetaKeyClick: function (e) {
        this.fireAndForward('editable:vertex:metakeyclick', e);
    },

    onVertexMarkerAltClick: function (e) {
        this.fireAndForward('editable:vertex:altclick', e);
    },

    onVertexMarkerContextMenu: function (e) {
        this.fireAndForward('editable:vertex:contextmenu', e);
    },

    onVertexMarkerMouseDown: function (e) {
        this.fireAndForward('editable:vertex:mousedown', e);
    },

    onMiddleMarkerMouseDown: function (e) {
        this.fireAndForward('editable:middlemarker:mousedown', e);
    },

    onVertexMarkerDrag: function (e) {
        this.onMove(e);
        if (this.feature._bounds) this.extendBounds(e);
        this.fireAndForward('editable:vertex:drag', e);
    },

    onVertexMarkerDragStart: function (e) {
        this.fireAndForward('editable:vertex:dragstart', e);
    },

    onVertexMarkerDragEnd: function (e) {
        this.fireAndForward('editable:vertex:dragend', e);
    },

    setDrawnLatLngs: function (latlngs) {
        this._drawnLatLngs = latlngs || this.getDefaultLatLngs();
    },

    startDrawing: function () {
        if (!this._drawnLatLngs) this.setDrawnLatLngs();
        L.Editable.BaseEditor.prototype.startDrawing.call(this);
    },

    startDrawingForward: function () {
        this.startDrawing();
    },

    endDrawing: function () {
        this.tools.detachForwardLineGuide();
        this.tools.detachBackwardLineGuide();
        if (this._drawnLatLngs && this._drawnLatLngs.length < this.MIN_VERTEX) this.deleteShape(this._drawnLatLngs);
        L.Editable.BaseEditor.prototype.endDrawing.call(this);
        delete this._drawnLatLngs;
    },

    addLatLng: function (latlng) {
        if (this._drawing === L.Editable.FORWARD) this._drawnLatLngs.push(latlng);
        else this._drawnLatLngs.unshift(latlng);
        this.feature._bounds.extend(latlng);
        this.addVertexMarker(latlng, this._drawnLatLngs);
        this.refresh();
    },

    newPointForward: function (latlng) {
        this.addLatLng(latlng);
        this.tools.attachForwardLineGuide();
        this.tools.anchorForwardLineGuide(latlng);
    },

    newPointBackward: function (latlng) {
        this.addLatLng(latlng);
        this.tools.anchorBackwardLineGuide(latlng);
    },

    push: function (latlng) {
        if (!latlng) return console.error('L.Editable.PathEditor.push expect a vaild latlng as parameter');
        if (this._drawing === L.Editable.FORWARD) this.newPointForward(latlng);
        else this.newPointBackward(latlng);
    },

    removeLatLng: function (latlng) {
        latlng.__vertex.delete();
        this.refresh();
    },

    pop: function () {
        if (this._drawnLatLngs.length <= 1) return;
        var latlng;
        if (this._drawing === L.Editable.FORWARD) latlng = this._drawnLatLngs[this._drawnLatLngs.length - 1];
        else latlng = this._drawnLatLngs[0];
        this.removeLatLng(latlng);
        if (this._drawing === L.Editable.FORWARD) this.tools.anchorForwardLineGuide(this._drawnLatLngs[this._drawnLatLngs.length - 1]);
        else this.tools.anchorForwardLineGuide(this._drawnLatLngs[0]);
        return latlng;
    },

    processDrawingClick: function (e) {
        if (e.vertex && e.vertex.editor === this) return;
        if (this._drawing === L.Editable.FORWARD) this.newPointForward(e.latlng);
        else this.newPointBackward(e.latlng);
        this.fireAndForward('editable:drawing:clicked', e);
    },

    onDrawingMouseMove: function (e) {
        L.Editable.BaseEditor.prototype.onDrawingMouseMove.call(this, e);
        if (this._drawing) {
            this.tools.moveForwardLineGuide(e.latlng);
            this.tools.moveBackwardLineGuide(e.latlng);
        }
    },

    refresh: function () {
        this.feature.redraw();
        this.onEditing();
    },

    newShape: function (latlng) {
        var shape = this.addNewEmptyShape();
        if (!shape) return;
        this.setDrawnLatLngs(shape[0] || shape);  // Polygon or polyline
        this.startDrawingForward();
        this.fireAndForward('editable:shape:new', { shape: shape });
        if (latlng) this.newPointForward(latlng);
    },

    deleteShape: function (shape, latlngs) {
        var e = { shape: shape };
        L.Editable.makeCancellable(e);
        this.fireAndForward('editable:shape:delete', e);
        if (e._cancelled) return;
        shape = this._deleteShape(shape, latlngs);
        if (this.ensureNotFlat) this.ensureNotFlat();  // Polygon.
        this.feature.setLatLngs(this.getLatLngs());  // Force bounds reset.
        this.refresh();
        this.reset();
        this.fireAndForward('editable:shape:deleted', { shape: shape });
        return shape;
    },

    _deleteShape: function (shape, latlngs) {
        latlngs = latlngs || this.getLatLngs();
        if (!latlngs.length) return;
        var self = this,
            inplaceDelete = function (latlngs, shape) {
                // Called when deleting a flat latlngs
                shape = latlngs.splice(0, Number.MAX_VALUE);
                return shape;
            },
            spliceDelete = function (latlngs, shape) {
                // Called when removing a latlngs inside an array
                latlngs.splice(latlngs.indexOf(shape), 1);
                if (!latlngs.length) self._deleteShape(latlngs);
                return shape;
            };
        if (latlngs === shape) return inplaceDelete(latlngs, shape);
        for (var i = 0; i < latlngs.length; i++) {
            if (latlngs[i] === shape) return spliceDelete(latlngs, shape);
            else if (latlngs[i].indexOf(shape) !== -1) return spliceDelete(latlngs[i], shape);
        }
    },

    deleteShapeAt: function (latlng) {
        var shape = this.feature.shapeAt(latlng);
        if (shape) return this.deleteShape(shape);
    },

    appendShape: function (shape) {
        this.insertShape(shape);
    },

    prependShape: function (shape) {
        this.insertShape(shape, 0);
    },

    insertShape: function (shape, index) {
        this.ensureMulti();
        shape = this.formatShape(shape);
        if (typeof index === 'undefined') index = this.feature._latlngs.length;
        this.feature._latlngs.splice(index, 0, shape);
        this.feature.redraw();
        if (this._enabled) this.reset();
    },

    extendBounds: function (e) {
        this.feature._bounds.extend(e.vertex.latlng);
    },

    _onDragStart: function (e) {
        this.editLayer.clearLayers();
        L.Editable.BaseEditor.prototype._onDragStart.call(this, e);
    },

    _onDragEnd: function (e) {
        this.initVertexMarkers();
        L.Editable.BaseEditor.prototype._onDragEnd.call(this, e);
    }

});
