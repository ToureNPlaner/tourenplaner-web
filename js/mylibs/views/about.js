window.AboutView = Backbone.View.extend({
    
    id: 'about',
    className: 'modal',

    events: {
        "click .modal-footer a": "onClose",
        "hidden": "remove"
    },

    render: function () {
        this.$el.html(templates.aboutView);
        this.$el.modal({
            show: true,
            keyboard: true,
            backdrop: 'static'
        });

        return this;
    },

    onClose: function () {
        this.$el.modal('hide');
    },

    remove: function () {
        this.$el.remove();
    }

});