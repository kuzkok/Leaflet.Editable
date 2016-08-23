var keepEditable = function () {
    // Make sure you can remove/readd an editable layer.
    this.on('add', this._onEditableAdd);
};
L.Marker.addInitHook(keepEditable);
L.Polyline.addInitHook(keepEditable);
