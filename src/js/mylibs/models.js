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
    }

});
