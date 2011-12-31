window.Router = Backbone.Router.extend({

    routes: {
        "/login":           "login",            // #/login
        "/logout":          "logout",           // #/logout
        "/register":        "register",         // #/register
        "/settings":        "settings",         // #/settings
        "/import":          "import",           // #/import
        "/admin":           "admin",            // #/admin
        "/admin/user":      "adminNewUser",     // #/admin/user
        "/admin/user/:id":  "adminEditUser",    // #/admin/user/42
        "/billing":         "billing",          // #/billing
        "/route/:id":       "request"           // #/route/42
    },

    initialize: function(options) {
        this.user = new User();
        this.user.bind('login', _.bind(this.onLogin, this));

        this.lastURL = window.location.hash.substr(1);
        this.navigate('');
    },

    initServer: function() {
        var that = this;
        var loadingView = new LoadingView($._('Loading server informations')).render();

        window.server.getServerInfo(function() {
            if (window.server.isPublic()) {
                window.body.topbar.hideNavigation();
                that.onLogin(true);
            } else if (!that.user.isLoggedIn()) {
                that.navigate('/login', true);
            }
            loadingView.remove();
        });
    },

    login: function() {
        if (!window.server.isPublic())
            new LoginView().render();
    },

    logout: function() {
        if (this.user.isLoggedIn()) {
            this.user.logout();
            this.navigate('/login', true);
        }
    },

    register: function() {
        if (!window.server.isPublic() && !this.user.isLoggedIn())
            new RegisterView().render();
    },

    settings: function() {
        if (!window.server.isPublic() && this.user.isLoggedIn())
            new UserDialogView().render();
    },

    "import": function() {
        if (!window.server.isPublic() && this.user.isLoggedIn()) {
            if (Modernizr.file) {
                new ImExportView().render();
            } else {
                new MessageView({
                    title: $._('Error!'),
                    message: $._('Your browser doesn\'t support the HTML 5 File API.<br /> To use the Im-/Export functionality, please upgrade your browser.')
                }).render();
            }
        }
    },

    admin: function() {
        if (!window.server.isPublic() && this.user.get("admin"))
            this.adminView = new AdminView({remove: _.bind(this.onAdminRemove, this)}).render();
    },

    adminNewUser: function() {
        if (!window.server.isPublic() && this.user.get("admin")) {
            if (_.isNull(this.adminView) || _.isUndefined(this.adminView))
                this.admin();

            this.adminView.setContent(new UserView().render());
        }  
    },

    adminEditUser: function(id) {
        if (!window.server.isPublic() && this.user.get("admin")) {
            if (_.isNull(this.adminView) || _.isUndefined(this.adminView))
                this.admin();

            // Use sessionStorage if available
            if (Modernizr.sessionstorage && !_.isNull(sessionStorage.getItem('edit-user'))) {
                var user = new User();
                user.set(JSON.parse(sessionStorage.getItem('edit-user')));
                this.adminView.setContent(new UserView({model: user}).render());
                sessionStorage.removeItem('edit-user');
                return;
            }

            this.loadingView = new LoadingView($._('Loading user informations')).render();

            var that = this;
            var model = new User().load(id, function () {
                that.adminView.setContent(new UserView({model: this}).render());
                that.loadingView.remove();
            });
        }
    },

    billing: function() {
        if (!window.server.isPublic() && this.user.get("admin"))
            this.billingView = new BillingView({remove: _.bind(this.onBillingRemove, this)}).render();
    },

    request: function(id) {
        alert('To be implemented');
    },

    onAdminRemove: function () {
        this.adminView = null;
    },

    onBillingRemove: function () {
        this.billingView = null;
    },

    onLogin: function (success) {
        if (success && !_.isUndefined(this.lastURL) && !_.isNull(this.lastURL)) {
            this.navigate(this.lastURL, true);
            this.lastURL = null;
        }
    }

});
