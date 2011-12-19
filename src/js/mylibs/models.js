window.Mark = Backbone.Model.extend({
    defaults: {
        name: "",
        lonlat: null,
        k: "",
        position: 99999
    },

    getLonLatAs1984: function () {
        var lonlat = this.get("lonlat");
        if (lonlat != null) {
            return window.mapModel.get("mapObject").transformTo1984(this.get("lonlat"));
        } else {
            // error!
            log("Fehler in Markmodel");
            return null;
        }
    },
    
    setLonLatWith1984: function (lon,lat){
		if(lon != null && lat != null){
    		var tempLon = lon / 1e7;
    		var tempLat = lat / 1e7;
			var tempLonLat = new OpenLayers.LonLat(tempLon,tempLat);
    		var newLonLat = window.mapModel.get("mapObject").transformFrom1984(tempLonLat);
			this.set({'lonlat':newLonLat});
		} else {
            // error!
            log("Fehler in Markmodel");
        }
    },

    toJSON: function () {
        // We're using ints here instead of floats for performance improvements (Java is a bit slow)
        
        var json = {
            "ln": Math.floor(this.getLonLatAs1984().lon * 1e7),
            "lt": Math.floor(this.getLonLatAs1984().lat * 1e7),
            "name": this.get("name"),
            "k": this.get("k")
        };
        
        // get all pointconstraints for currently selected algorithm
        var pointconstraints = window.server.getCurrentAlgorithm().pointconstraints;
        
        if (pointconstraints != null) {
			for (var i = 0; i < pointconstraints.length; i++) {
				var key = pointconstraints[i].name;
				
				if (this.get(key) != undefined) {
					json[key] = this.get(key);
				} else {
					// what if it is undefined? write "" or let View (onSend)
					// check before sending to server?
				}
			}
		}
		
		return json;
    },
    
    findNearestNeighbour: function (){
    	var that = this;
        // get nearest neighbour
        var point = this.toJSON();
		window.api.nearestNeighbour({
			points: point,
			callback: function(text, success){
				if(success && (!isNaN(text.way[0].ln) && !isNaN(text.way[0].lt))){
					that.setLonLatWith1984(text.way[0].ln,text.way[0].lt);
				}
				else
					log("Nearest Nabour Search wasn't successful. No points updated");
			}
		});
		window.mapModel.get("mapObject").drawMarkers();
    }
});

window.PointConstraint = Backbone.Model.extend({

   defaults: {
      name: "",
      type: "",
      minValue: 0,
      maxvalue: 0,
      value: 0
   },
   
   toJSON: function() {
      return {
         "name": this.get("name"),
         "type": this.get("type"),
         "min": this.get("minvalue"),
         "max": this.get("maxValue")
      };
   }

});

window.MarkList = Backbone.Collection.extend({

    model: Mark,

    comparator: function (mark) {
        return mark.get('position');
    },

    setStartMark: function (mark) {
        if (mark.get('position') == 0) {
            return;
        } else if (mark.get('position') >= this.length) {
            this._moveAllMarks(0, 1);
            mark.set({position: 0});
            this.add(mark);
        } else {
            for (var i = 0; i < mark.get('position'); ++i)
                this.at(i).set({position: this.at(i).get('position') + 1});
            mark.set({position: 0});
            this.sort();
        }
    },

    getStartMark: function (mark) {
        if (this.length > 0)
            return this.at(0);
        return null;
    },

    setTargetMark: function (mark) {
        if (mark.get('position') < this.length - 1) {
            var oldpos = mark.get('position')
            mark.set({position: this.length - 1});

            this._moveAllMarks(oldpos + 1, -1);
            this.sort();
        } else if (mark.get('position') >= this.length) {
            this.appendMark(mark);
        }

    },

    getTargetMark: function (mark) {
		if (this.length > 1)
            return this.at(this.length - 1);
        return null;
	},

    appendMark: function (mark) {
        mark.set({position: this.length});
        this.add(mark, {
            at: this.length
        });
    },

    indexOfMark: function (mark) {
        return this.indexOf(mark);
    },

    moveMark: function (mark, pos) {
        this.deleteMark(mark);
        mark.set({position: pos});
        this._moveAllMarks(pos, 1);
        this.add(mark, {
            at: pos
        });
    },

    deleteMark: function (mark) {
        this._moveAllMarks(mark.get('position') + 1, -1);
        this.remove(mark);
    },

    deleteAllMarks: function () {
        this.reset(null);
    },

    getMarkByLonLat: function (lonlat) {
        var ret = null;
        for (var i = 0; i < this.length; i++) {
            var l = this.at(i).get("lonlat");
            if (l == lonlat) {
                ret = this.at(i);
            }
        }

        return ret;
    },

    toJSON: function () {
        var ret = [];
        for (var i = 0; i < this.length; i++) {
            ret.push(this.at(i).toJSON());
        }

        return ret;
    },

    /**
     * Move the position of all marks +1 or -1
     *
     * @param from The starting index
     * @param direction -1 or 1
     */
    _moveAllMarks: function (from, direction) {
        for (var i = from; i < this.length; ++i)
            this.at(i).set({position: this.at(i).get('position') + 1 * direction});
    }
});

window.MapModel = Backbone.Model.extend({

    defaults: {
        "mapObject": new Map("map")
    },

    setRoute: function (routeString) {
        this.set({
            route: routeString
        });
    },

    setDataViewMarker: function (marker) {
        this.set({
            dataViewText: marker
        });
    }
});

window.User = Backbone.Model.extend({

    defaults: {
        login: false
    },

    initialize: function () {
        window.server.bind("info-loaded", _.bind(this.onStartup, this));
    },

    onStartup: function () {
        var cookie = $.cookie('tourenplaner');
        if (cookie && !_.isUndefined(cookie)) {
            var dec, decarr;
            try {
                dec = Base64.decode(cookie);
                decarr = dec.split(':');
                log(dec, decarr);
                if (decarr.length == 2)
                    return this.login(decarr[0], decarr[1]);
            } catch (e) {
                log('Invalid cookie', cookie);
            }
            cookie = null;
        }

        $.cookie('tourenplaner', cookie);
        return cookie == null;
    },

    login: function (email, password) {
        var that = this;
        return window.api.authUser({
            email: email,
            password: password,
            callback: function (text, success) {
                if (success) {
                    $.cookie('tourenplaner', Base64.encode(email + ':' + password), {
                        expires: 7,
                        path: '/'
                    });
                    that.set(text);
                    that.set({
                        login: true
                    });

                    log('Login successful');
                } else {
                    $.cookie('tourenplaner', null);
                }
                that.trigger('login', success);
            }
        });
    },

    logout: function () {
        $.cookie('tourenplaner', null);
        this.set({
            login: false
        });
        this.trigger('login', false);
    },

    isLoggedIn: function () {
        return this.get('login');
    },

    register: function (args) {
        var ret = window.api.registerUser({
            userObject: this.toUserobject(),
            callback: function (text, success) {
                if (success && _.isFunction(args.success)) args.success();
                else if (!success && _.isFunction(args.error)) args.error(text);
            }
        });

        if (!ret && _.isFunction(args.error))
            args.error('Incorrect arguments');
    },

    toUserobject: function () {
        return this.attributes;
    },

    fromUserobject: function (obj) {
        this.set(obj);
    }

});

window.ServerInfo = Backbone.Model.extend({
    defaults: {
        version: null,
        servertype: 'public',
        port: 80,
        ssl: false,
        algorithms: []
    },

    initialize: function () {

    },

    getServerInfo: function (callback) {
        var that = this;
        window.api.serverInformation({
            callback: function (text, success) {
                if (!success)
                    return;
                var obj = text;
                if (_.isString(obj))
                    obj = JSON.parse(obj);

                if (!_.isNaN(obj.sslport) && !_.isUndefined(obj.sslport)) {
                    that.set({
                        'ssl': true,
                        'port': obj.sslport
                    });
                }
                that.set({
                    servertype: obj.servertype,
                    version: obj.version,
                    algorithms: obj.algorithms
                });

                if (_.isFunction(callback))
                    callback();
                that.trigger("info-loaded");
            }
        });
    },

    isPublic: function () {
        return this.get('servertype') == "public";
    },
    
    
    // maybe this is not the correct place for this method.
    // will be moved later.
    getCurrentAlgorithm: function() {
		return window.server.get("algorithms")[$('#algorithms')[0].selectedIndex];
	}

});
