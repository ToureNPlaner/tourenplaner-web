window.Router = Backbone.Router.extend({

    routes: {
        "/login":        "login",    // #/login
        "/logout":       "logout",   // #/logout
        "/register":     "register", // #/register
        "/settings":     "settings", // #/settings
        "/admin":        "admin",    // #/admin
        "/admin/users":  "adminUsers", // #/admin/users
        "/admin/requests": "adminRequests", // #/admin/requests
        "/billing":      "billing",  // #/billing
        "/route/:id":    "request"   // #/route/7
    },

    initialize: function(options) {
        //window.server = new ServerInfo();
        this.user = new User();
    },

    initServer: function() {
        var that = this;
        this.loadingView = new LoadingView($._('Loading server informations')).render();

        window.server.getServerInfo(function() {
            if (window.server.isPublic())
                window.body.topbar.hideNavigation();
            that.loadingView.remove();
        });
    },

    login: function() {
        new LoginView().render();
    },

    logout: function() {
        if (this.user.isLoggedIn())
            this.user.logout();
        this.navigate('');
    },

    register: function() {
        new RegisterView().render();
    },

    settings: function() {
        alert('To be implemented');
    },

    admin: function() {
        this.adminView = new AdminView({remove: _.bind(this.onAdminRemove, this)}).render();
    },
    
    adminUsers: function () {
        if (_.isNull(this.adminView) || _.isUndefined(this.adminView))
            this.admin();
        new AdminUsersView({parent: this.adminView}).render();
    },
    
    adminRequests: function () {
        if (_.isNull(this.adminView) || _.isUndefined(this.adminView))
            this.admin();
        new AdminRequestsView({parent: this.adminView}).render();
    },

    billing: function() {
        alert('To be implemented');
    },

    request: function(id) {
        alert('To be implemented');
    },
    
    onAdminRemove: function () {
        log("onAdminRemove");
        this.admin = null;
    }

});
