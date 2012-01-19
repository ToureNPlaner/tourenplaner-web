window.GuiModel = Backbone.Model.extend({

    setDataViewMarker: function (marker) {
        this.set({
            dataViewText: marker
        });
    },
    
    // maybe this is not the correct place for this method.
    // will be moved later.
    getCurrentAlgorithm: function() {
        return window.server.get("algorithms")[$('#algorithms')[0].selectedIndex];
    }
    
});
