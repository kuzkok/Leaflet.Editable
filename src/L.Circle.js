L.Circle.include({

    getEditorClass: function (map) {
        return (map && map.options.circleEditorClass) ? map.options.circleEditorClass : L.Editable.CircleEditor;
    }

});
