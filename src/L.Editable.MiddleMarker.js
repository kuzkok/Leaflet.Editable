L.Editable.MiddleMarker = L.Marker.extend({

    options: {
        opacity: 0.5,
        className: 'leaflet-div-icon leaflet-middle-icon',
        draggable: true
    },

    initialize: function (left, right, latlngs, editor, options) {
        this.left = left;
        this.right = right;
        this.editor = editor;
        this.latlngs = latlngs;
        L.Marker.prototype.initialize.call(this, this.computeLatLng(), options);
        this._opacity = this.options.opacity;
        this.options.icon = this.editor.tools.createVertexIcon({ className: this.options.className });
        this.editor.editLayer.addLayer(this);
        this.setVisibility();
    },

    setVisibility: function () {
        var leftPoint = this._map.latLngToContainerPoint(this.left.latlng),
            rightPoint = this._map.latLngToContainerPoint(this.right.latlng),
            size = L.point(this.options.icon.options.iconSize);
        if (leftPoint.distanceTo(rightPoint) < size.x * 3) {
            this.hide();
        } else {
            this.show();
        }
    },

    show: function () {
        this.setOpacity(this._opacity);
    },

    hide: function () {
        this.setOpacity(0);
    },

    updateLatLng: function () {
        this.setLatLng(this.computeLatLng());
        this.setVisibility();
    },

    computeLatLng: function () {
        var leftPoint = this.editor.map.latLngToContainerPoint(this.left.latlng),
            rightPoint = this.editor.map.latLngToContainerPoint(this.right.latlng),
            y = (leftPoint.y + rightPoint.y) / 2,
            x = (leftPoint.x + rightPoint.x) / 2;
        return this.editor.map.containerPointToLatLng([x, y]);
    },

    onAdd: function (map) {
        L.Marker.prototype.onAdd.call(this, map);
        L.DomEvent.on(this._icon, 'mousedown touchstart', this.onMouseDown, this);
        map.on('zoomend', this.setVisibility, this);
    },

    onRemove: function (map) {
        delete this.right.middleMarker;
        L.DomEvent.off(this._icon, 'mousedown touchstart', this.onMouseDown, this);
        map.off('zoomend', this.setVisibility, this);
        L.Marker.prototype.onRemove.call(this, map);
    },

    onMouseDown: function (e) {
        var iconPos = L.DomUtil.getPosition(this._icon),
            latlng = this.editor.map.layerPointToLatLng(iconPos);
        e = {
            originalEvent: e,
            latlng: latlng
        };
        if (this.options.opacity === 0) return;
        L.Editable.makeCancellable(e);
        this.editor.onMiddleMarkerMouseDown(e);
        if (e._cancelled) return;
        this.latlngs.splice(this.index(), 0, e.latlng);
        this.editor.refresh();
        var icon = this._icon;
        var marker = this.editor.addVertexMarker(e.latlng, this.latlngs);
        /* Hack to workaround browser not firing touchend when element is no more on DOM */
        var parent = marker._icon.parentNode;
        parent.removeChild(marker._icon);
        marker._icon = icon;
        parent.appendChild(marker._icon);
        marker._initIcon();
        marker._initInteraction();
        marker.setOpacity(1);
        /* End hack */
        // Transfer ongoing dragging to real marker
        L.Draggable._dragging = false;
        marker.dragging._draggable._onDown(e.originalEvent);
        this.delete();
    },

    delete: function () {
        this.editor.editLayer.removeLayer(this);
    },

    index: function () {
        return this.latlngs.indexOf(this.right.latlng);
    }

});

L.Editable.mergeOptions({
    middleMarkerClass: L.Editable.MiddleMarker
});
