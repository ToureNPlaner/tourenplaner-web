var _markerNameSuffix = "A";

/**
 * Main view of the application.
 */
window.BodyView = Backbone.View.extend({
    el: $('body'),

    events: {
        "click": "onBodyClick"
    },

    /**
     * Constructor of the BodyView class. Initializes all visible elements of the page.
     */
    initialize: function () {
        this.topbar = new TopbarView().render();
        this.main = new MainView().render();
    },

    /**
     * Hide the dropdown menu if anything other than the menu is clicked.
     */
    onBodyClick: function () {
        this.topbar.hideDropdown();
    }
});

/**
 * Displays the sidebar, map and dataview.
 */
window.MainView = Backbone.View.extend({

    id: 'main',
    attributes: {
        role: 'main'
    },

    /**
     * Initialize and render the contained views.
     *
     * @return The instance of the class
     */
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

/**
 * Display a message to the user in a modal dialog.
 */
window.MessageView = Backbone.View.extend({

    id: 'message',
    className: 'modal',

    events: {
        "hidden": "remove",
        "click .modal-footer a.cancel" : "remove"
    },

    /**
     * Constructor of the MessageView class. Initializes the contents of the dialog.
     *
     * @params args.title The displayed title of the dialog
     * @param args.message The displayed message of the dialog
     */
    initialize: function (args) {
        args = args || {};
        this.title = args.title || "";
        this.message = args.message || "";
    },

    /**
     * Render the dialog from the template.
     *
     * @return The instance of the class
     */
    render: function () {
        $(this.el).html(templates.messageView({title: this.title, message: this.message}));

        $(this.el).modal({
            show: true,
            backdrop: 'static',
            keyboard: false
        });
        return this;
    },

    /**
     * Hide the dialog and remove the element.
     */
    remove: function () {
        if ($(this.el).modal(true).isShown)
            $(this.el).modal('hide');

        $(this.el).remove();
    }
});

/**
 * Display a loading indicator and corresponding message in a modal dialog.
 */
window.LoadingView = Backbone.View.extend({

    id: 'loading',
    className: 'modal',

    /**
     * Constructor of the LoadingView class. Initializes the contents of the dialog.
     *
     * @param message The displayed message of the dialog
     */
    initialize: function (message) {
        this.message = message;
    },

    /**
     * Render the dialog from the template.
     *
     * @return The instance of the class
     */
    render: function () {
        $(this.el).html(templates.loadingView({message: this.message}));

        $(this.el).modal({
            show: true,
            backdrop: 'static',
            keyboard: false
        });
        return this;
    },

    /**
     * Hide the dialog and remove the element.
     */
    remove: function () {
        $(this.el).modal('hide');
        $(this.el).remove();
    }
});
