L.Editable.BaseEditor = L.Handler.extend({

    initialize: function (map, feature, options) {
        L.setOptions(this, options);
        this.map = map;
        this.feature = feature;
        this.feature.editor = this;
        this.editLayer = new L.LayerGroup();
        this.tools = this.options.editTools || map.editTools;
    },

    addHooks: function () {
        if (this.isConnected()) this.onFeatureAdd();
        else this.feature.once('add', this.onFeatureAdd, this);
        this.onEnable();
        this.feature.on(this._getEvents(), this);
        return;
    },

    removeHooks: function () {
        this.feature.off(this._getEvents(), this);
        if (this.feature.dragging) this.feature.dragging.disable();
        this.editLayer.clearLayers();
        this.tools.editLayer.removeLayer(this.editLayer);
        this.onDisable();
        if (this._drawing) this.cancelDrawing();
        return;
    },

    drawing: function () {
        return !!this._drawing;
    },

    onFeatureAdd: function () {
        this.tools.editLayer.addLayer(this.editLayer);
        if (this.feature.dragging) this.feature.dragging.enable();
    },

    hasMiddleMarkers: function () {
        return !this.options.skipMiddleMarkers && !this.tools.options.skipMiddleMarkers;
    },

    fireAndForward: function (type, e) {
        e = e || {};
        e.layer = this.feature;
        this.feature.fire(type, e);
        this.tools.fireAndForward(type, e);
    },

    onEnable: function () {
        this.fireAndForward('editable:enable');
    },

    onDisable: function () {
        this.fireAndForward('editable:disable');
    },

    onEditing: function () {
        this.fireAndForward('editable:editing');
    },

    onStartDrawing: function () {
        this.fireAndForward('editable:drawing:start');
    },

    onEndDrawing: function () {
        this.fireAndForward('editable:drawing:end');
    },

    onCancelDrawing: function () {
        this.fireAndForward('editable:drawing:cancel');
    },

    onCommitDrawing: function (e) {
        this.fireAndForward('editable:drawing:commit', e);
    },

    onDrawingMouseDown: function (e) {
        this.fireAndForward('editable:drawing:mousedown', e);
    },

    onDrawingMouseUp: function (e) {
        this.fireAndForward('editable:drawing:mouseup', e);
    },

    startDrawing: function () {
        if (!this._drawing) this._drawing = L.Editable.FORWARD;
        this.tools.registerForDrawing(this);
        this.onStartDrawing();
    },

    commitDrawing: function (e) {
        this.onCommitDrawing(e);
        this.endDrawing();
    },

    cancelDrawing: function () {
        this.onCancelDrawing();
        this.endDrawing();
    },

    endDrawing: function () {
        this._drawing = false;
        this.tools.unregisterForDrawing(this);
        this.onEndDrawing();
    },

    onDrawingClick: function (e) {
        if (!this.drawing) return;
        L.Editable.makeCancellable(e);
        this.fireAndForward('editable:drawing:click', e);
        if (e._cancelled) return;
        if (!this.isConnected()) this.connect(e);
        this.processDrawingClick(e);
    },

    isConnected: function () {
        return this.map.hasLayer(this.feature);
    },

    connect: function (e) {
        this.tools.connectCreatedToMap(this.feature);
        this.tools.editLayer.addLayer(this.editLayer);
    },

    onMove: function (e) {
        this.fireAndForward('editable:drawing:move', e);
    },

    onDrawingMouseMove: function (e) {
        this.onMove(e);
    },

    _getEvents: function () {
        return {
            dragstart: this._onDragStart,
            drag: this._onDrag,
            dragend: this._onDragEnd,
            remove: this.disable
        };
    },

    _onDragStart: function (e) {
        this.onEditing();
        this.fireAndForward('editable:dragstart', e);
    },

    _onDrag: function (e) {
        this.fireAndForward('editable:drag', e);
    },

    _onDragEnd: function (e) {
        this.fireAndForward('editable:dragend', e);
    }

});
