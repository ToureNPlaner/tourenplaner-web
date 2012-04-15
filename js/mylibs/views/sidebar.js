window.SidebarView = Backbone.View.extend({

    id: 'sidebar',

    events: {
        "click a.clear": "onClear",
        "click a.send": "onSend",
        "click a.flip": "onFlip",
        "click a.showAlgs": "onShowAlgs"
    },

    initialize: function () {
        this.marks = [];

        $(window).resize(_.bind(this.onResize, this));

        window.markList.bind("add", _.bind(this.onMarkAdded, this));
        window.markList.bind("remove", _.bind(this.onMarkRemoved, this));
        window.markList.bind("reset", _.bind(this.onListReset, this));
    },

    render: function () {
        this.$el.html(templates.sidebarView);
        $('#main').append(this.el);

        this.onResize();

        this.$el.resizable({
            handles: 'e'
        });

        this.$('#marks').sortable({
            update: _.bind(this.onMarkListSortUpdate, this)
        });
        this.$('#marks').disableSelection();

        return this;
    },

    onMarkAdded: function (model, collection, options) {
        if (this.marks.length === 0)
            this.$('#marks').html('');

        var view = new MarkView({model: model, id: 'mark_' + model.cid}).render();
        this.marks.push(view);
        model.set({view: view});

        this._sortMarks();
    },

    onMarkRemoved: function (model, collection) {
        for (var i in this.marks) {
            if (_.isEqual(this.marks[i].cid, model.get('view').cid))
                this.marks.splice(i, 1);
        }
        model.get('view').remove();

        if (this.marks.length === 0)
            this.$('#marks').html('No points defined!');

        this._sortMarks();
    },

    onMarkListSortUpdate: function (event, ui) {
        var mark = ui.item;
        var cid = mark.attr('id').split('_')[1];

        var markModel = window.markList.getByCid(cid);
        window.markList.moveMark(markModel, mark.index());
    },

    onListReset: function () {
        this.marks = [];

        if (window.markList.length === 0) {
            _markerNameSuffix = "A";
            this.$('#marks').html($._('No points defined!'));
        } else {
            for (var i = 0; i < window.markList.length; ++i) {
                var model = window.markList.at(i);
                var view = new MarkView({model: model, id: 'mark_' + model.cid});
                model.set({view: view});
                this.marks.push(view);
            }
            this._sortMarks();
        }
    },

    onSend: function () {
        var alg = window.algview.getSelectedAlgorithm().urlsuffix;
        if (_.isUndefined(alg) || _.isEmpty(alg))  {
            new MessageView({
                title: $._('Error'),
                message: $._('No algorithm selected.')
            }).render();
        } else if (window.markList.length < window.algview.getSelectedAlgorithm().details.minpoints) {
            new MessageView({
               title: $._('Error'),
               message: $._('Not enough points defined.')
            }).render();
        } else if (window.markList.length > window.algview.getSelectedAlgorithm().details.maxpoints) {
            new MessageView({
               title: $._('Error'),
               message: $._('Too much points defined.')
            }).render();
        } else {
            loadingView = new LoadingView($._('Waiting for response from server ...')).render();
            
            var jsonObj = {
                alg: window.algview.$('input[@name=alg]:checked').val(),
                points: window.markList.toJSON(),
                callback: function (text, success) {
                    if (success) {
                        for (var i = 0; i < text.points.length; i++) {
                            var pos = text.points[i].position;
                            if (pos < window.markList.length) {
                                window.markList.moveMark(window.markList.at(pos), i);
                            }
                        }
                        window.map.drawRoute(text);
                        if (!_.isUndefined(text.requestid))
                            window.app.navigate('route/' + text.requestid);
                    }
                    loadingView.remove();
                }
            };

            // if constraints are available, then add them to request object
            var constraints = window.algview.getConstraintSettings();
            if (constraints != null) {
                jsonObj['constraints'] = constraints;
            }
            window.api.alg(jsonObj);
        }
    },

    onClear: function () {
        window.markList.deleteAllMarks();
        window.map.drawRoute("");
        window.map.resetRoute();
    },

    onFlip: function() {
        window.markList.flip();
    },

    onShowAlgs: function() {
       $('#algview').toggle();
    },

    onResize: function () {
        var $cont = this.$('.container');
        // 76 = 40 (header) + Padding (sidebar) + 11(hr) + 20 (padding #marks)
        var height = $(window).height() - 76 - $cont.first().height() - $cont.last().height() - $cont.next().next().children('h3').height();

        this.$el.height($(window).height() - 40);
        this.$('#marks').css('max-height', height + 'px');
    },

    _sortMarks: function () {
        this.marks = _.sortBy(this.marks, function (view) {
            return window.markList.indexOfMark(view.model);
        });

        this.$('#marks').html('');
        for (var i in this.marks)
            this.marks[i].render();
    }
});
