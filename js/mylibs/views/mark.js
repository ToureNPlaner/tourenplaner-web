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

        this.$('a.view').click(_.bind(this.onClick, this));
        this.model.bind('change:name', _.bind(this.onNameChange, this));
        this.model.bind('change:position', _.bind(this.onPositionChange, this));

        return this;
    },

    remove: function () {
        this.model.unbind('change:name', _.bind(this.onNameChange, this));
        this.$el.remove();
    },

    getPosition: function () {
        var sourceIsTarget = window.body.main.algview.getSelectedAlgorithm().details.sourceistarget;    
        if (!sourceIsTarget && this.model.get('position') === 0)
            return ' (' + $._('Start') + ')';
        else if (!sourceIsTarget && this.model.get('position') == window.markList.length - 1)
            return ' (' + $._('Target') + ')';
        else if (sourceIsTarget && this.model.get('position') === 0)
            return ' (' + $._('Start/Target') + ')';
        return '';
    },

    getTemplate: function () {
        var position = this.getPosition();
        return templates.markView({cid: this.model.cid, name: this.name, position: position});
    },

    onClick: function () {
        window.body.main.data.showMarker(this.model);
    },

    onNameChange: function () {
        this.$('a.view').html(this.model.get('name'));
    },

    onPositionChange: function (model, pos) {
        var old = model.previous('position');
        var old_html = this.$el.contents()[1] || "";

        if (old != pos && (pos == 0 || pos == window.markList.length - 1 || (_.isString(old_html) && !_.isEmpty(old_html)))) {
            log("position change", old, "to", pos);
            var position = this.getPosition();

            this.$el.contents().filter(function() { return this.nodeType == 3; }).remove();
            this.$el.append(position);
        }
    }
});
