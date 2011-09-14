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
	mapObject.initializeMap();
	mapObject.contextMenu();
	mapObject.refresh();
	
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
    
    initialize: function() { },
   
    render: function() {
        this.el.dialog({
            modal: true,
            resizable: false,
            buttons: {
                "Login" : _.bind(this.onLogin, this),
                "Cancel" : _.bind(this.remove, this)
            },
            close: _.bind(this.onClose, this)
        });
        
        return this;
    },
    
    remove: function() {
        this.el.dialog('close');
    },
    
    onLogin: function() {
        var username = this.$('input#email').val();
        var password = this.$('input#password').val();
        if (!window.app.user.login(username, password))
            this.$('.validate').show();
        else
            this.remove();
    },
    
    onClose: function() {
        this.$('input').val('').removeClass('ui-state-error');
        this.$('.validate').hide();
        window.app.navigate('');
    }
});
