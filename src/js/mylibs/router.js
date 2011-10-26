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
    
    initServer: function() {
        //TODO: Run a /info query to the server and display a modal loading dialog
        this.loadingView = new LoadingView().render();
        
        window.api.serverInformation();
        
        this.loadingView.remove();
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
        if (_.isNull(this.registerView) || _.isUndefined(this.registerView))
            this.registerView = new RegisterView();
        this.registerView.render();
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
