L.Marker.include({

    getEditorClass: function (map) {
        return (map && map.options.markerEditorClass) ? map.options.markerEditorClass : L.Editable.MarkerEditor;
    }

});
