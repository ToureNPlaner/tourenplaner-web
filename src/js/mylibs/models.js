window.Mark = Backbone.Model.extend({
    defaults: {
        name: "Marker",
        position: -1,
        lonlat: null,
        k: ""
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
        }
    },

    getJSON: function () {
        var s = {
            "lt": this.getLonLatAs1984().lat,
            "ln": this.getLonLatAs1984().lon,
            "k": this.get("k")
        };
        return JSON.stringify(s);
    }
});

window.MarkList = Backbone.Collection.extend({
    model: Mark,

    initialize: function () {

    },

    setStartMark: function (mark) {
        if (this.length > 1) {
            var toRemove = this.at(0);
            this.remove(toRemove);
        }
        this.add(mark, {
            at: 0
        });
    },

    setTargetMark: function (mark) {
        if (this.length > 1) {
            var toRemove = this.at(this.length - 1);
            this.remove(toRemove);
        }
        this.add(mark);
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

    getJSON: function () {
        var ret = "[";
        var comma = "";
        for (var i = 0; i < this.length; i++) {
            if (i == this.length - 1) {
                comma = "";
            }
            ret += this.at(i).getJSON() + comma;
        }
        ret += "]";

        return ret;
    }
});



window.MapModel = Backbone.Model.extend({

    defaults: {
        "mapObject": new Map("map"),
        "markList": new MarkList()
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
                if (decarr.length == 2) return this.login(decarr[0], decarr[1]);
            } catch (e) {
                log('Invalid cookie', cookie);
            }
            cookie = null;
        }

        //TODO: Add ssl: true if ssl is enabled on this server
        $.cookie('tourenplaner', cookie);
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
                if (!_.isNaN(text.sslport) && !_.isUndefined(text.sslport)) that.set({
                    'ssl': true,
                    'port': text.sslport
                });
                that.set({
                    servertype: text.servertype,
                    version: text.version,
                    algorithms: text.algorithms
                });
                if (_.isFunction(callback)) callback();
            }
        });
    },

    isPublic: function () {
        return this.get('servertype') == "public";
    }

});
