window.BodyView = Backbone.View.extend({
    el: $('body'),

    events: {
        "click": "onBodyClick"
    },

    initialize: function() {
        this.topbar = new TopbarView();
        this.main = new MainView();
    },

    onBodyClick: function() {
        this.topbar.hideDropdown();
    }
});

window.TopbarView = Backbone.View.extend({

    el: $('header'),

    events: {
        "click a.menu": "showDropdown"
    },

    initialize: function() {
        window.app.user.bind('login', this.onLogin, this);
        this.$('ul li.menu, ul li.user').each(function() {
            $(this).css('display', 'block').hide();
        });
    },

    hideDropdown: function() {
        this.$('li.menu').removeClass('open');
    },

    showDropdown: function() {
        this.$('li.menu').toggleClass('open');
        return false; // Return false stops the click event from propagating (for example to the body event)
    },

    onLogin: function(login) {
        var user = window.app.user;

        if (user.isLoggedIn()) {
            this.$('li.user a').html(user.get('firstname') + ' ' + user.get('lastname'));
            this.$('li.user, li.menu').show();
            this.$('li.login-link, li.register-link').hide();
        } else {
            this.$('li.user, li.menu').hide();
            this.$('li.login-link, li.register-link').show();
        }
    }

});

window.MainView = Backbone.View.extend({

    el: $('#main'),

    initialize: function() {
        this.sidebar = new SidebarView();
        this.map = new MapView({ sidebar: this.sidebar });
        this.data = new DataView();
    }
});

window.SidebarView = Backbone.View.extend({

    el: $('#main #sidebar'),

    initialize: function() {
        this.onResize();

        $(window).resize(_.bind(this.onResize, this));
        this.el.resizable({
            handles: 'e'
        })
    },

    onResize: function() {
        this.el.height($(window).height() - 40);
    }
});

// update map size when resize sidebar
var resizeUpdater = function(event, ui) {
$("#main #map").css('left', ui.size.width);
$("#main #map").css('width', "100%");
$("#main #map").css('height', "100%");
mapObject.refresh();
};
// $("#main #sidebar").bind("resizestop", resizeUpdater);
$("#main #sidebar").bind("resize", resizeUpdater);

var mapObject;
window.MapView = Backbone.View.extend({

    el: $('#main #map'),

    initialize: function(args) {
        this.onResize(args.sidebar);
        $(window).resize(_.bind(this.onResize, this));
    mapObject = new Map("map");
    setContextMenu();
    mapObject.refresh();

    /* FOR TESTING */
    mapObject.drawRoute("[9.219390,48.680170,0.000000],[9.219080,48.680060,0.000000],[9.219080,48.680060,0.000000],[9.219190,48.679820,0.000000],[9.219700,48.679140,0.000000],[9.219810,48.678840,0.000000],[9.219810,48.678700,0.000000],[9.219810,48.678700,0.000000],[9.218010,48.678460,0.000000],[9.216390,48.678180,0.000000],[9.216210,48.678110,0.000000],[9.216210,48.678110,0.000000],[9.216430,48.677350,0.000000],[9.217050,48.676210,0.000000],[9.217050,48.676210,0.000000],[9.216960,48.676060,0.000000],[9.216670,48.675870,0.000000],[9.216390,48.674940,0.000000],[9.216180,48.674640,0.000000],[9.215950,48.674430,0.000000],[9.215380,48.674090,0.000000],[9.214870,48.673720,0.000000],[9.214500,48.673290,0.000000],[9.214130,48.672400,0.000000],[9.213890,48.671620,0.000000],[9.213600,48.671060,0.000000],[9.213360,48.670800,0.000000],[9.212360,48.669990,0.000000],[9.212360,48.669990,0.000000],[9.212200,48.669980,0.000000],[9.212210,48.669870,0.000000],[9.212280,48.669850,0.000000],[9.212390,48.669890,0.000000],[9.213250,48.669290,0.000000],[9.213250,48.669290,0.000000],[9.212990,48.669190,0.000000],[9.212910,48.669190,0.000000],[9.212370,48.669320,0.000000],[9.212190,48.669320,0.000000],[9.211310,48.669000,0.000000],[9.211160,48.668880,0.000000],[9.211160,48.668880,0.000000],[9.211040,48.668720,0.000000],[9.211180,48.668140,0.000000],[9.211180,48.667870,0.000000]");

    },

    onResize: function(sidebar) {
        var width = 0;
        try {
            width = sidebar.el.outerWidth();
        } catch (e) {
            width = window.body.main.sidebar.el.outerWidth();
        }
        this.el.height($(window).height() - 40);
        this.el.width($(window).width());
    }
});

window.DataView = Backbone.View.extend({

    el: $('#main #data'),

    /**
     * Used to save the old size (before minimizing). Using this, we can restore the old size.
     */
    oldStyle: "",

    events: {
        "click span.minmax a": "onMinMax"
    },

    initialize: function() {
        this.el.resizable({
           handles: "n, nw, w"
        });
    },

    onMinMax: function() {
        this.el.toggleClass('minimized');
        this.$('.content').toggle();

        var link = this.$('.minmax a');
        if (link.html() === '_') {
            link.html('Daten');

            this.oldStyle = this.el.attr('style');
            this.el.attr('style', '');
        } else {
            link.html('_');

            this.el.attr('style', this.oldStyle);
        }
    }
});

window.LoginView = Backbone.View.extend({

    el: $('#login'),

    events: {
        "hidden": "onClose",
        "click .modal-footer a.login": "onLogin",
        "click .modal-footer a.cancel": "remove"
    },

    initialize: function() {
        window.app.user.bind('login', _.bind(this.onLoginSuccess, this));
    },

    render: function() {
        this.el.modal({
            show: true,
            backdrop: 'static',
            keyboard: false
        });
        return this;
    },

    remove: function() {
        this.el.modal('hide');
    },

    onLogin: function() {
        // Clear old error messages first
        this.$('.alert-message').hide();

        var email = this.$('input#email').val();
        var password = this.$('input#password').val();
        if (email.length < 1 || password.length < 1) {
            log('Invalid data');
            this.$('.error-empty').show();
            return;
        }

        window.app.user.login(email, password);
    },

    onLoginSuccess: function(success) {
        if (success) {
            this.remove();
        } else {
            this.$('.error-correct').show();
        }
    },

    onClose: function() {
        this.$('input').each(function() {
            $(this).val('');
        });

        this.$('.alert-message').hide();
        window.app.navigate('');
    }
});
