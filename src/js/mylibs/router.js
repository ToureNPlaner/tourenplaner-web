window.Router = Backbone.Router.extend({

    routes: {
        "/login":        "login",    // #/login
        "/logout":       "logout",   // #/logout
        "/register":     "register", // #/register
        "/settings":     "settings", // #/settings
        "/admin":        "admin",    // #/admin
        "/admin/user/:id":  "adminUser", // #/admin/user/42
        "/billing":      "billing",  // #/billing
        "/route/:id":    "request"   // #/route/42
    },

    initialize: function(options) {
        //window.server = new ServerInfo();
        this.user = new User();
        this.user.bind('login', this.onLogin);

        this.lastURL = window.location.hash;
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
            alert('To be implemented');
    },

    admin: function() {
        if (!window.server.isPublic() && this.user.get("admin"))
            this.adminView = new AdminView({remove: _.bind(this.onAdminRemove, this)}).render();
    },

    adminUser: function(id) {
        if (!window.server.isPublic() && this.user.get("admin")) {
            if (_.isNull(this.adminView) || _.isUndefined(this.adminView))
                this.admin();

            this.loadingView = new LoadingView($._('Loading user informations')).render();

            var that = this;
            var model = new User().load(id, function () {
                that.adminView.setContent(new AdminUserView({model: model}).render());
                that.loadingView.remove();
            });
        }
    },

    billing: function() {
        if (!window.server.isPublic() && this.user.get("admin"))
            alert('To be implemented');
    },

    request: function(id) {
        alert('To be implemented');
    },

    onAdminRemove: function () {
        log("onAdminRemove");
        this.admin = null;
    },

    onLogin: function (success) {
        if (success && !_.isUndefined(this.lastURL) && !_.isNull(this.lastURL)) {
            this.navigate(this.lastURL, true);
            this.lastURL = null;
        }
    }

});
