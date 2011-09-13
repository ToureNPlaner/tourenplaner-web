window.Router = Backbone.Router.extend({

    routes: {
        "/login":        "login",    // #/login
        "/logout":       "logout",   // #/logout
        "/register":     "register", // #/register
        "/settings":     "settings", // #/settings
        "/billing":      "billing",  // #/billing
        "/route/:id":    "request"   // #/route/7
    },

    initialize: function(options) {
        this.user = new User();
    },

    login: function() {
        if (_.isNull(this.loginView) || _.isUndefined(this.loginView))
            this.loginView = new LoginView();
        this.loginView.render();
    },

    logout: function() {
        if (this.user.isLoggedIn())
            this.user.logout();
        this.navigate('');
    },

    register: function() {
        alert('To be implemented');
    },

    settings: function() {
        alert('To be implemented');
    },

    billing: function() {
        alert('To be implemented');
    },

    request: function(id) {
        alert('To be implemented');
    }

});
