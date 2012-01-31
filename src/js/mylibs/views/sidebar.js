window.SidebarView = Backbone.View.extend({

    id: 'sidebar',

    events: {
        "click a.clear": "onClear",
        "click a.send": "onSend",
        "click a.flip": "onFlip"
    },

    initialize: function () {
        this.marks = [];

        $(window).resize(_.bind(this.onResize, this));

        window.server.bind("info-loaded", _.bind(this.onInfoLoaded, this));
        window.markList.bind("add", _.bind(this.onMarkAdded, this));
        window.markList.bind("remove", _.bind(this.onMarkRemoved, this));
        window.markList.bind("reset", _.bind(this.onListReset, this));
    },

    render: function () {
        $(this.el).html(templates.sidebarView);
        $('#main').append(this.el);

        this.onResize();

        $(this.el).resizable({
            handles: 'e'
        });

        this.$('#marks').sortable({
            update: _.bind(this.onMarkListSortUpdate, this)
        });
        this.$('#marks').disableSelection();

        return this;
    },

    onInfoLoaded: function () {
        var algorithms = window.server.get('algorithms');
        var $algorithms = this.$('#algorithms');

        if (!_.isUndefined(algorithms) && algorithms.length > 0) {
            $algorithms.children().remove();
            for (var i in algorithms) {
                if (!algorithms[i].details.hidden)
                    $algorithms.append('<option value="' + algorithms[i].urlsuffix + '">' + $._(algorithms[i].name) + '</option>');
            }
        }
    },

    onMarkAdded: function (model, collection, options) {
        if (this.marks.length === 0)
            this.$('#marks').html('');

        var view = new MarkView({model: model}).render();
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
            for (var i = 0; i < window.markList.length; ++i)
                this.marks.push(new MarkView({model: window.markList.at(i)}));
            this._sortMarks();
        }
    },

    onSend: function () {
        var alg = this.$('#algorithms').val();
        if (_.isUndefined(alg) || _.isEmpty(alg))  {
            new MessageView({
                title: $._('Error'),
                message: $._('No algorithm selected.')
            }).render();
        } else if (window.markList.length < window.server.get("algorithms")[$('#algorithms')[0].selectedIndex].constraints.minPoints) {
            new MessageView({
               title: $._('Error'),
               message: $._('Not enough points defined.')
            }).render();
        } else {
            loadingView = new LoadingView($._('Waiting for response from server ...')).render();
            window.api.alg({
                alg: this.$('#algorithms').val(),
                points: window.markList.toJSON(),
                callback: function (text, success) {
                    if (success) {
                        window.map.drawRoute(text);
                        if (!_.isUndefined(text.requestid))
                            window.app.navigate('/route/' + text.requestid);
                    }
                    loadingView.remove();
                }
            });
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

    onResize: function () {
        var $cont = this.$('.container');
        // 76 = 40 (header) + Padding (sidebar) + 11(hr) + 20 (padding #marks)
        var height = $(window).height() - 76 - $cont.first().height() - $cont.last().height() - $cont.next().next().children('h3').height();

        $(this.el).height($(window).height() - 40);
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
