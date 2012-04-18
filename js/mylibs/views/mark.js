window.MarkView = Backbone.View.extend({

    id: '',
    className: 'mark',
    model: null,
    events: {
        'click a.view': 'onClick'
    },

    initialize: function () {
        this.id = 'mark_' + this.model.cid;
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
        this.$el.html(this.getTemplate());
        $('#marks').append(this.el);

        this.$('a.view').click(_.bind(this.onClick, this));
        this.model.bind('change:name', _.bind(this.onNameChange, this));

        return this;
    },

    remove: function () {
        this.model.unbind('change:name', _.bind(this.onNameChange, this));
        this.$el.remove();
    },

    getTemplate: function () {
        var position = '',
            sourceIsTarget = window.body.main.algview.getSelectedAlgorithm().details.sourceistarget;
        if (!sourceIsTarget && this.model.get('position') === 0)
            position = '(' + $._('Start') + ')';
        else if (!sourceIsTarget && this.model.get('position') == window.markList.length - 1)
            position = '(' + $._('Target') + ')';
        else if (sourceIsTarget && this.model.get('position') === 0)
            position = '(' + $._('Start/Target') + ')';

        return templates.markView({cid: this.model.cid, name: this.name, position: position});
    },

    onClick: function () {
        window.body.main.data.showMarker(this.model);
    },

    onNameChange: function () {
        this.$('a.view').html(this.model.get('name'));
    }
});
