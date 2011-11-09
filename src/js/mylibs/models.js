window.Mark = Backbone.Model.extend({
    defaults: {
        name: "Marker",
        lonlat: null,
        k: "",
        type: 0 // 1 = startMark, 2 = targetMark
    },

    initialize: function () {

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

    toJSON: function () {
        return {
            "lt": this.getLonLatAs1984().lat,
            "ln": this.getLonLatAs1984().lon,
            "k": this.get("k")
        };
    }
});

window.MarkList = Backbone.Collection.extend({
    model: Mark,

    initialize: function () {

    },

    setStartMark: function (mark) {
        if (this.length > 0 && (this.at(0).get("type") == 1)) {
            this.remove(this.at(0), {silent: true});
        }
        
        mark.set({type: 1});
        
        this.add(mark, {
            at: 0
        });
    },
    
    getStartMark: function (mark) {
        var ret = null;
        if (this.length > 0 && (this.at(0).get("type") == 1)) {
            ret = this.at(0);
        }
        
        return ret;
    },

    setTargetMark: function (mark) {
        if (this.length > 0 && (this.at(this.length - 1).get("type") == 2)) {
            var toRemove = this.at(this.length - 1, {silent: true});
            this.remove(toRemove);
        }
        
        mark.set({type:2});
        
        this.add(mark);
    },

    getTargetMark: function (mark) {
		var ret = null;
        if (this.length > 0 && (this.at(this.length - 1).get("type") == 2)) {
            var ret = this.at(this.length - 1);
        }
        
        return ret;
	},

    appendMark: function (mark) {
        var at = this.length - 1;
        if (at < 0) {
            at = 0;
        }
        
        this.add(mark, {
            at: at
        });
    },

    indexOfMark: function (mark) {
        return this.indexOf(mark);
    },

    moveMark: function (mark, pos) {
        this.remove(mark);
        this.add(mark, {
            at: pos
        });
    },

    deleteMark: function (mark) {
        this.remove(mark);
    },

    deleteAllMarks: function () {
        this.reset(null);
    },

    getMarkAtPos: function (pos) {
        return this.at(pos);
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

    /** Don't use initialize here because it gets called too early */
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

        //TODO: Add ssl: true if ssl is enabled on this server
        $.cookie('tourenplaner', cookie);
        return cookie == null;
    },

    login: function (email, password) {
        var that = this;
        window.api.authUser({
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

        if (!ret && _.isFunction(args.error)) args.error('Incorrect arguments');
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
    }

});
