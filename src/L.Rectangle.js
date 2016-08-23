L.Rectangle.include({

    getEditorClass: function (map) {
        return (map && map.options.rectangleEditorClass) ? map.options.rectangleEditorClass : L.Editable.RectangleEditor;
    }

});
