window.MapModel = Backbone.Model.extend({
    initialize: function() {
	this.set({ mapObject : new Map("map") });
	this.set({ test : "TestString" });
    },

    setRoute: function(routeString) {
	this.set({ route : routeString });
    },

    /* following code will be changed, when more marks needed */
    setStartMark: function(posInLonLat) {
        this.set({startMark : posInLonLat});
    },

    setTargetMark: function(posInLonLat) {
        this.set({targetMark : posInLonLat});
    },

    setDataViewText: function(text) {
	this.set({dataViewText : text});
    }
});

window.User = Backbone.Model.extend({

    defaults: {
        login: false
    },

    /** Don't use initialize here because it gets called too early */
    onStartup: function() {
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
    },

    login: function(email, password) {
        var that = this;
        window.api.authUser({
            email: email,
            password: password,
            callback: function(text, success) {
                if (success) {
                    $.cookie('tourenplaner', Base64.encode(email + ':' + password), {expires: 7, path: '/'});
                    that.set(text);
                    that.set({ login: true });

                    log('Login successful');
                } else {
                    $.cookie('tourenplaner', null);
                }
                that.trigger('login', success);
            }
        });
    },

    logout: function() {
        $.cookie('tourenplaner', null);
        this.set({login: false});
        this.trigger('login', false);
    },

    isLoggedIn: function() {
        return this.get('login');
    },
    
    register: function(args) {
        var ret = window.api.registerUser({
            //TODO: Supply own method to get json without converting to string and back
            userObject: JSON.parse(JSON.stringify(this)),
            callback: function(text, success) {
                if (success && _.isFunction(args.success))
                    args.success();
                else if (!success && _.isFunction(args.error))
                    args.error(text);
            }
        });
        
        if (!ret && _.isFunction(args.error))
            args.error('Incorrect arguments');
    }

});

window.ServerInfo = Backbone.Model.extend({
    defaults: {
        version: null,
        servertype: 'public',
        sslport: 443,
        algorithms: []
    }   
});
