window.Body = Backbone.View.extend({
    el: $('body'),

    events: {
        "click": "onBodyClick"
    },

    initialize: function() {
        this.topbar = new Topbar();
        this.main = new Main();
    },

    onBodyClick: function() {
        this.topbar.hideDropdown();
    }
});

window.Topbar = Backbone.View.extend({

    el: $('header'),

    events: {
        "click a.menu": "showDropdown"
    },

    initialize: function() {
        window.app.user.bind('login', this.onLogin, this);

        this.$('ul li.menu, ul li.user').hide();
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
        this.$('ul li').toggle();

        if (user.isLoggedIn())
            this.$('li.user a').html(user.get('firstname') + ' ' + user.get('lastname'));
    }

});

window.Main = Backbone.View.extend({

    el: $('#main'),

    initialize: function() {
        this.sidebar = new Sidebar();
        this.map = new Map({ sidebar: this.sidebar });
    }
});

window.Sidebar = Backbone.View.extend({

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

window.Map = Backbone.View.extend({

    el: $('#main #map'),

    initialize: function(args) {
        this.onResize(args.sidebar);

        $(window).resize(_.bind(this.onResize, this));
    },

    onResize: function(sidebar) {
        var width = 0;
        try {
            width = sidebar.el.outerWidth();
        } catch (e) {
            width = window.body.main.sidebar.el.outerWidth();
        }
        this.el.height($(window).height() - 40);
        this.el.width($(window).width() - width);
    }
});
