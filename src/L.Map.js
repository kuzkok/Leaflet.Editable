L.Map.mergeOptions({
    editToolsClass: L.Editable
});

L.Map.addInitHook(function () {

    this.whenReady(function () {
        if (this.options.editable) {
            this.editTools = new this.options.editToolsClass(this, this.options.editOptions);
        }
    });

});
