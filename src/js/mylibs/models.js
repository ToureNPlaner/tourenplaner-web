window.Mark = Backbone.Model.extend({
    defaults: {
        name: "",
        lonlat: null,
        k: "",
        position: 99999
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
        // We're using ints here instead of floats for performance improvements (Java is a bit slow)
        return {
            "ln": Math.floor(this.getLonLatAs1984().lon * 1e7),
            "lt": Math.floor(this.getLonLatAs1984().lat * 1e7),
            "k": this.get("k")
        };
    }
});

window.MarkList = Backbone.Collection.extend({
    model: Mark,

    initialize: function () {

    },

    comparator: function (mark) {
        return mark.get('position');
    },

    setStartMark: function (mark) {
        if (mark.get('position') == 0)
            return;

        for (var i = 0; i < this.length; ++i)
            this.at(i).set({position: this.at(i).get('position') + 1});

        mark.set({position: 0});
        if (!this.getByCid(mark.cid))
            this.add(mark);

        this.sort();
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

            for (var i = oldpos + 1; i < this.length; ++i)
                this.at(i).set({position: this.at(i).get('position')});

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
        this.remove(mark);
        mark.set('position', pos);
        this.add(mark, {
            at: pos
        });
    },

    deleteMark: function (mark) {
        for (var i = mark.get('position') + 1; i < this.length; ++i)
            this.at(i).set({position: this.at(i).get('position') - 1});
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
