window.MarkView = Backbone.View.extend({

    el: null,
    model: null,

    initialize: function () {
        this.name = this.model.get('name');
        if (_.isEmpty(this.name)) {
            this.name = $._("Marker") + " " + _markerNameSuffix;
            this.model.set({name: this.name});
            _markerNameSuffix = String.fromCharCode(_markerNameSuffix.charCodeAt(0) + 1);
            if (_markerNameSuffix.charCodeAt(0) > 90)
                _markerNameSuffix = "A";
        }
    },

    render: function () {
        var position = '';
        if (this.model.get('position') === 0)
            position = '(' + $._('Start') + ')';
        else if (this.model.get('position') == window.markList.length - 1)
            position = '(' + $._('Target') + ')';

        $('#marks').append(templates.markView({cid: this.model.cid, name: this.name, position: position}));
        this.el = $('#mark_'+this.model.cid);

        this.$('a.view').click(_.bind(this.onClick, this));

        return this;
    },

    remove: function () {
        this.el.remove();
    },

    onClick: function () {
        window.guiModel.setDataViewMarker(this.model);
    }
});
