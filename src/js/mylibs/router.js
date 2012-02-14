/**
 * The Router class is responsible for all url changes and opening the corresponding views. 
 */
window.Router = Backbone.Router.extend({

    /** Maps routes to functions */
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

    /**
     * Constructor for the Router class. Initializes the user.
     */
    initialize: function() {
        this.user = new User();
        this.user.bind('login', _.bind(this.onLogin, this));

        this.lastURL = window.location.hash.substr(1);
        this.navigate('');
    },

    /**
     * Get the informations of the server and display accordingly.
     */
    initServer: function() {
        var that = this;
        var loadingView = new LoadingView($._('Loading server information')).render();

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

    /**
     * Display the login view.
     */
    login: function() {
        if (!window.server.isPublic())
            new LoginView().render();
    },

    /**
     * Log the user out and display the login view.
     */
    logout: function() {
        if (this.user.isLoggedIn()) {
            window.map.resetRoute();
            window.map.resetMarkers();
            this.user.logout();
            this.navigate('/login', true);
        }
    },

    /**
     * Display the register view.
     */
    register: function() {
        if (!window.server.isPublic() && !this.user.isLoggedIn())
            new RegisterView().render();
    },

    /**
     * Display the settings view.
     */
    settings: function() {
        if (!window.server.isPublic() && this.user.isLoggedIn())
            new UserDialogView().render();
    },

    /**
     * Display the im-/export view.
     */
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

    /**
     * Display the admin view.
     */
    admin: function() {
        if (!window.server.isPublic() && this.user.get("admin"))
            this.adminView = new AdminView({remove: _.bind(this.onAdminRemove, this)}).render();
    },

    /**
     * Change the content of the admin view to the new user view.
     */
    adminNewUser: function() {
        if (!window.server.isPublic() && this.user.get("admin")) {
            if (_.isNull(this.adminView) || _.isUndefined(this.adminView))
                this.admin();

            this.adminView.setContent(new UserView().render());
        }  
    },

    /**
     * Change the content of the admin view to the edit user view.
     *
     * @param id The id of the user to edit
     */
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

            this.loadingView = new LoadingView($._('Loading user information')).render();

            var that = this;
            var model = new User().load(id, function () {
                that.adminView.setContent(new UserView({model: this}).render());
                that.loadingView.remove();
            });
        }
    },

    /**
     * Display the billing view.
     */
    billing: function() {
        if (!window.server.isPublic())
            this.billingView = new BillingView({remove: _.bind(this.onBillingRemove, this)}).render();
    },

    /**
     * Display an old request by loading it from the server.
     *
     * @param id The id of the old request
     */
    request: function(id) {
        window.api.getResponse({
            id: id,
            callback: function(text, success) {
                this.loadingView = new LoadingView($._('Loading route information')).render();
                if (success) {
                    window.map.resetRoute();
                    window.map.resetMarkers();
                    window.map.drawMarkersAndRoute(text);
                }
                this.loadingView.remove();
            }
        })
    },

    onAdminRemove: function () {
        this.adminView = null;
    },

    onBillingRemove: function () {
        this.billingView = null;
    },

    /**
     * Navigate to the requested url after a successful login.
     */
    onLogin: function (success) {
        if (success && !_.isUndefined(this.lastURL) && !_.isNull(this.lastURL)) {
            this.navigate(this.lastURL, true);
            this.lastURL = null;
        }
    }

});
