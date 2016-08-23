var EditableMixin = {

    createEditor: function (map) {
        map = map || this._map;
        var Klass = this.options.editorClass || this.getEditorClass(map);
        return new Klass(map, this, this.options.editOptions);
    },

    enableEdit: function (map) {
        if (!this.editor) this.createEditor(map);
        this.editor.enable();
        return this.editor;
    },

    editEnabled: function () {
        return this.editor && this.editor.enabled();
    },

    disableEdit: function () {
        if (this.editor) {
            this.editor.disable();
            delete this.editor;
        }
    },

    toggleEdit: function () {
        if (this.editEnabled()) this.disableEdit();
        else this.enableEdit();
    },

    _onEditableAdd: function () {
        if (this.editor) this.enableEdit();
    }

};

L.Polyline.include(EditableMixin);
L.Polygon.include(EditableMixin);
L.Marker.include(EditableMixin);
L.Rectangle.include(EditableMixin);
L.Circle.include(EditableMixin);
