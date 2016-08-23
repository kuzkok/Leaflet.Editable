L.Editable = L.Evented.extend({

    statics: {
        FORWARD: 1,
        BACKWARD: -1
    },

    options: {
        zIndex: 1000,
        polygonClass: L.Polygon,
        polylineClass: L.Polyline,
        markerClass: L.Marker,
        rectangleClass: L.Rectangle,
        circleClass: L.Circle,
        drawingCSSClass: 'leaflet-editable-drawing',
        drawingCursor: 'crosshair'
    },

    initialize: function (map, options) {
        L.setOptions(this, options);
        this._lastZIndex = this.options.zIndex;
        this.map = map;
        this.editLayer = this.createEditLayer();
        this.featuresLayer = this.createFeaturesLayer();
        this.forwardLineGuide = this.createLineGuide();
        this.backwardLineGuide = this.createLineGuide();
    },

    fireAndForward: function (type, e) {
        e = e || {};
        e.editTools = this;
        this.fire(type, e);
        this.map.fire(type, e);
    },

    createLineGuide: function () {
        var options = L.extend({ dashArray: '5,10', weight: 1, interactive: false }, this.options.lineGuideOptions);
        return L.polyline([], options);
    },

    createVertexIcon: function (options) {
        return L.Browser.touch ? new L.Editable.TouchVertexIcon(options) : new L.Editable.VertexIcon(options);
    },

    createEditLayer: function () {
        return this.options.editLayer || new L.LayerGroup().addTo(this.map);
    },

    createFeaturesLayer: function () {
        return this.options.featuresLayer || new L.LayerGroup().addTo(this.map);
    },

    moveForwardLineGuide: function (latlng) {
        if (this.forwardLineGuide._latlngs.length) {
            this.forwardLineGuide._latlngs[1] = latlng;
            this.forwardLineGuide._bounds.extend(latlng);
            this.forwardLineGuide.redraw();
        }
    },

    moveBackwardLineGuide: function (latlng) {
        if (this.backwardLineGuide._latlngs.length) {
            this.backwardLineGuide._latlngs[1] = latlng;
            this.backwardLineGuide._bounds.extend(latlng);
            this.backwardLineGuide.redraw();
        }
    },

    anchorForwardLineGuide: function (latlng) {
        this.forwardLineGuide._latlngs[0] = latlng;
        this.forwardLineGuide._bounds.extend(latlng);
        this.forwardLineGuide.redraw();
    },

    anchorBackwardLineGuide: function (latlng) {
        this.backwardLineGuide._latlngs[0] = latlng;
        this.backwardLineGuide._bounds.extend(latlng);
        this.backwardLineGuide.redraw();
    },

    attachForwardLineGuide: function () {
        this.editLayer.addLayer(this.forwardLineGuide);
    },

    attachBackwardLineGuide: function () {
        this.editLayer.addLayer(this.backwardLineGuide);
    },

    detachForwardLineGuide: function () {
        this.forwardLineGuide.setLatLngs([]);
        this.editLayer.removeLayer(this.forwardLineGuide);
    },

    detachBackwardLineGuide: function () {
        this.backwardLineGuide.setLatLngs([]);
        this.editLayer.removeLayer(this.backwardLineGuide);
    },

    blockEvents: function () {
        // Hack: force map not to listen to other layers events while drawing.
        if (!this._oldTargets) {
            this._oldTargets = this.map._targets;
            this.map._targets = {};
        }
    },

    unblockEvents: function () {
        if (this._oldTargets) {
            // Reset, but keep targets created while drawing.
            this.map._targets = L.extend(this.map._targets, this._oldTargets);
            delete this._oldTargets;
        }
    },

    registerForDrawing: function (editor) {
        if (this._drawingEditor) this.unregisterForDrawing(this._drawingEditor);
        this.map.on('mousemove touchmove', editor.onDrawingMouseMove, editor);
        this.blockEvents();
        this._drawingEditor = editor;
        this.map.on('mousedown', this.onMousedown, this);
        this.map.on('mouseup', this.onMouseup, this);
        L.DomUtil.addClass(this.map._container, this.options.drawingCSSClass);
        this.defaultMapCursor = this.map._container.style.cursor;
        this.map._container.style.cursor = this.options.drawingCursor;
    },

    unregisterForDrawing: function (editor) {
        this.unblockEvents();
        L.DomUtil.removeClass(this.map._container, this.options.drawingCSSClass);
        this.map._container.style.cursor = this.defaultMapCursor;
        editor = editor || this._drawingEditor;
        if (!editor) return;
        this.map.off('mousemove touchmove', editor.onDrawingMouseMove, editor);
        this.map.off('mousedown', this.onMousedown, this);
        this.map.off('mouseup', this.onMouseup, this);
        if (editor !== this._drawingEditor) return;
        delete this._drawingEditor;
        if (editor._drawing) editor.cancelDrawing();
    },

    onMousedown: function (e) {
        this._mouseDown = e;
        this._drawingEditor.onDrawingMouseDown(e);
    },

    onMouseup: function (e) {
        if (this._mouseDown) {
            // always fire mouse up whether its a click or not, since firing a
            // mouse down but never a mouse up if the mouse didn't move can lead
            // code using these events to think the mouse button is still down
            if (this._drawingEditor) {
                this._drawingEditor.onDrawingMouseUp(e);
            }

            // null check for the drawing editor again, just in case the mouse up
            // handler triggered something that nulled it out
            if (this._drawingEditor) {
                var origin = L.point(this._mouseDown.originalEvent.clientX, this._mouseDown.originalEvent.clientY);
                var distance = L.point(e.originalEvent.clientX, e.originalEvent.clientY).distanceTo(origin);

                // if the mouse hasn't moved this is a click
                if (Math.abs(distance) < 9 * (window.devicePixelRatio || 1)) {
                    this._drawingEditor.onDrawingClick(e);
                }
            }
        }
        this._mouseDown = null;
    },

    drawing: function () {
        return this._drawingEditor && this._drawingEditor.drawing();
    },

    stopDrawing: function () {
        this.unregisterForDrawing();
    },

    commitDrawing: function (e) {
        if (!this._drawingEditor) return;
        this._drawingEditor.commitDrawing(e);
    },

    connectCreatedToMap: function (layer) {
        return this.featuresLayer.addLayer(layer);
    }
});

L.extend(L.Editable, {

    makeCancellable: function (e) {
        e.cancel = function () {
            e._cancelled = true;
        };
    }

});
