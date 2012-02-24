window.User = Backbone.Model.extend({

    defaults: {
        login: false
    },

    initialize: function () {
        window.server.bind("info-loaded", _.bind(this.onStartup, this));
    },

    onStartup: function () {
        if (window.server.isPublic())
            return;

        var cookie = $.store('tourenplaner');
        if (cookie && !_.isUndefined(cookie)) {
            var dec, decarr;
            try {
                dec = Base64.decode(cookie);
                decarr = dec.split(':');
                if (decarr.length == 2)
                    return this.login(decarr[0], decarr[1]);
            } catch (e) {
                log('Invalid cookie', cookie);
            }
            cookie = null;
        }
        $.store('tourenplaner', cookie);
    },

    login: function (email, password) {
        var that = this;
        return window.api.authUser({
            email: email,
            password: password,
            callback: function (text, success) {
                if (success) {
                    $.store('tourenplaner', Base64.encode(email + ':' + password), {
                        expires: 7,
                        path: '/'
                    });
                    that.set(text);
                    that.set({
                        login: true
                    });

                    log('Login successful');
                } else {
                    $.store('tourenplaner', null);
                }
                that.trigger('login', success);
            }
        });
    },

    logout: function () {
        $.store('tourenplaner', null);
        this.set({
            login: false
        });
        window.api.logout();
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

    update: function (args) {
        var selfUpdate = false;
        if(this.get('userid') === window.app.user.get('userid'))
            selfUpdate = true;
        if (this.get('admin')){
            var ret = window.api.updateUser({
                id: this.get('userid'),
                userObject: this.toUserobject(),
                self: selfUpdate,
                callback: function (text, success) {
                    if (success && _.isFunction(args.success)) args.success();
                    else if (!success && _.isFunction(args.error)) args.error(text);
                }
            });
        } else {
            var ret = window.api.updateUser({
                userObject: this.toUserobject(),
                self: selfUpdate,
                callback: function (text, success) {
                    if (success && _.isFunction(args.success)) args.success();
                    else if (!success && _.isFunction(args.error)) args.error(text);
                }
            });
        }

        if (!ret && _.isFunction(args.error))
            args.error('Incorrect arguments');
    },

    load: function (id, callback) {
        if (!app.user.get('admin'))
            return app.user;

        var that = this;
        api.getUser({
            id: id,
            callback: function (text, success) {
                if (success) {
                    that.set(text);
                    callback();
                }
            }
        });

        return this;
    },

    toUserobject: function () {
        return this.attributes;
    },

    fromUserobject: function (obj) {
        this.set(obj);
    }

});