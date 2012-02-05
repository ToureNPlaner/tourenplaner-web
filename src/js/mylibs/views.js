var _markerNameSuffix = "A";

window.BodyView = Backbone.View.extend({
    el: $('body'),

    events: {
        "click": "onBodyClick"
    },

    initialize: function () {
        this.topbar = new TopbarView().render();
        this.main = new MainView().render();
    },

    onBodyClick: function () {
        this.topbar.hideDropdown();
    }
});

window.MainView = Backbone.View.extend({

    id: 'main',
    attributes: {
        role: 'main'
    },

    render: function () {
        $('#container').append(this.el);

        this.sidebar = new SidebarView().render();
        this.algview = new AlgView().render();
        this.map = new MapView({
            sidebar: this.sidebar
        }).render();
        this.data = new DataView().render();

        return this;
    }
});

window.MessageView = Backbone.View.extend({

    id: 'message',
    className: 'modal',

    events: {
        "hidden": "remove",
        "click .modal-footer a.cancel" : "remove"
    },

    initialize: function (args) {
        args = args || {};
        this.title = args.title || "";
        this.message = args.message || "";
    },

    render: function () {
        $(this.el).html(templates.messageView({title: this.title, message: this.message}));

        $(this.el).modal({
            show: true,
            backdrop: 'static',
            keyboard: false
        });
        return this;
    },

    remove: function () {
        if ($(this.el).modal(true).isShown)
            $(this.el).modal('hide');

        $(this.el).remove();
    }
});

window.LoadingView = Backbone.View.extend({

    id: 'loading',
    className: 'modal',

    initialize: function (message) {
        this.message = message;
    },

    render: function () {
        $(this.el).html(templates.loadingView({message: this.message}));

        $(this.el).modal({
            show: true,
            backdrop: 'static',
            keyboard: false
        });
        return this;
    },

    remove: function () {
        $(this.el).modal('hide');
        $(this.el).remove();
    }
});
