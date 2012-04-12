window.Mark = Backbone.Model.extend({
    defaults: {
        name: "",
        lonlat: null,
        k: "",
        position: 99999
    },

    getLonLatAs1984: function () {
        return this.get("lonlat");
    },

    setLonLatWith1984: function (lon, lat){
        if (!_.isNull(lon) && !_.isNull(lat))
            this.set({'lonlat': new L.LatLng(lat / 1e7, lon / 1e7)});
        else
            log("Fehler in Markmodel");
    },

    findNearestNeighbour: function (){
        var that = this;
        // get nearest neighbour
        var point = this.toJSON();
        window.api.alg({
            alg: 'nns',
            points: [point],
            callback: function(text, success) {
                if (success && (!_.isUndefined(text.points) && !_.isNaN(text.points[0].ln) && !_.isNaN(text.points[0].lt)))
                    that.setLonLatWith1984(text.points[0].ln,text.points[0].lt);
                else
                    log("Nearest Neighbour Search wasn't successful. No points updated");   
            }
        });
    },

    toJSON: function () {
        // We're using ints here instead of floats for performance improvements (Java is a bit slow)

        var json = {
            "ln": Math.floor(this.getLonLatAs1984().lng * 1e7),
            "lt": Math.floor(this.getLonLatAs1984().lat * 1e7),
            "name": this.get("name"),
            "position": this.get("position"),
            "k": this.get("k")
        };

        // get all pointconstraints for currently selected algorithm
        var pointconstraints = window.algview.getSelectedAlgorithm().pointconstraints;
        if (!_.isNull(pointconstraints)) {
            for (var i = 0; i < pointconstraints.length; i++) {
                var key = pointconstraints[i].id;
                if (!_.isUndefined(this.get(key))) {
                    json[key] = this.get(key);
                } else {
                    // what if it is undefined? write "" or let View (onSend)
                    // check before sending to server?
                }
            }
        }

        return json;
    },

    fromJSON: function(data) {
        this.set({
            name: data.name,
            position: data.position,
            k: data.k
        });

        this.setLonLatWith1984(data.ln, data.lt);

        return this;
    }
});