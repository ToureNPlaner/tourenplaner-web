window.UserDialogView = Backbone.View.extend({

    id: 'user-settings',
    className: 'modal',
    
    events: {
        "hidden": "remove"
    },

    render: function() {
        this.userView = new UserView({parent: this, model: window.app.user}).render();
        $(this.el).html(templates.userDialogView);
        this.$('.modal-body').html(this.userView.el);
        this.$('.modal-body h4').html('');

        $(this.el).modal({
            show: true,
            backdrop: 'static',
            keyboard: true
        });

        return this;
    },

    remove: function() {
        if ($(this.el).modal(true).isShown)
            $(this.el).modal('hide');

        this.userView.remove();
        $(this.el).remove();
    }
});