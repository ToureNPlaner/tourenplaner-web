window.Mark = Backbone.Model.extend({
    defaults: {
        name: "",
        lonlat: null,
        k: "",
        position: 99999
    },

    getLonLatAs1984: function () {
        var lonlat = this.get("lonlat");
        if (!_.isNull(lonlat)) {
            return window.map.transformTo1984(this.get("lonlat"));
        } else {
            // error!
            log("Fehler in Markmodel");
            return null;
        }
    },

    setLonLatWith1984: function (lon,lat){
        if(!_.isNull(lon) && !_.isNull(lat)){
            var tempLon = lon / 1e7;
            var tempLat = lat / 1e7;
            var tempLonLat = new OpenLayers.LonLat(tempLon,tempLat);
            var newLonLat = window.map.transformFrom1984(tempLonLat);
            this.set({'lonlat':newLonLat});
        } else {
            // error!
            log("Fehler in Markmodel");
        }
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
            "ln": Math.floor(this.getLonLatAs1984().lon * 1e7),
            "lt": Math.floor(this.getLonLatAs1984().lat * 1e7),
            "name": this.get("name"),
            "position": this.get("position"),
            "k": this.get("k")
        };

        // get all pointconstraints for currently selected algorithm
        var pointconstraints = window.server.get("algorithms")[$('#algorithms')[0].selectedIndex];
        if (!_.isNull(pointconstraints)) {
            for (var i = 0; i < pointconstraints.length; i++) {
                var key = pointconstraints[i].name;

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
        var tempLon = data.ln / 1e7;
        var tempLat = data.lt / 1e7;
        var tempLonLat = new OpenLayers.LonLat(tempLon,tempLat);

        this.set({
            name: data.name,
            position: data.position || 99999,
            k: data.k,
            lonlat: tempLonLat
        });
        return this;
    }
});