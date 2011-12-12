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

window.TopbarView = Backbone.View.extend({

    tagName: 'header',
    className: 'topbar',

    events: {
        "click a.menu": "showDropdown"
    },

    initialize: function () {
        window.app.user.bind('login', this.onLogin, this);
    },

    render: function () {
        $(this.el).html(_.template(templates.topbarView));
        $('#container').append(this.el);

        this.$('ul li.menu, ul li.user').each(function () {
            $(this).css('display', 'block').hide();
        });
        return this;
    },

    hideNavigation: function () {
        this.$('ul').hide();
    },

    hideDropdown: function () {
        this.$('li.menu').removeClass('open');
    },

    showDropdown: function () {
        this.$('li.menu').toggleClass('open');
        return false; // Return false stops the click event from propagating (for example to the body event)
    },

    onLogin: function (login) {
        var user = window.app.user;

        if (user.isLoggedIn()) {
            this.$('li.user a').html(user.get('firstname') + ' ' + user.get('lastname'));
            this.$('li.user, li.menu').show();
            this.$('li.login-link, li.register-link').hide();

            if (user.get('admin'))
                this.$('li.menu ul li.admin').show();
        } else {
            this.$('li.user, li.menu').hide();
            this.$('li.login-link, li.register-link').show();
            this.$('li.menu ul li.admin').hide();
        }
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
        this.map = new MapView({
            sidebar: this.sidebar
        }).render();
        this.data = new DataView().render();

        return this;
    }
});

window.SidebarView = Backbone.View.extend({

    id: 'sidebar',

    events: {
        "click #btnClear": "onClear",
        "click #btnSend": "onSend"
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
        $(this.el).html(_.template(templates.sidebarView));
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
            for (i in algorithms) {
                if (!algorithms[i].hidden)
                    $algorithms.append('<option value="' + algorithms[i].urlsuffix + '">' + $._(algorithms[i].name) + '</option>');
            }
        }
    },

    onMarkAdded: function (model, collection, options) {
        if (this.marks.length == 0)
            this.$('#marks').html('');

        var view = new MarkView({model: model}).render();
        this.marks.push(view);
        model.set({view: view});

        this._sortMarks();
    },

    onMarkRemoved: function (model, collection) {
        for (i in this.marks) {
            if (_.isEqual(this.marks[i].cid, model.get('view').cid))
                this.marks.splice(i, 1);
        }
        model.get('view').remove();

        if (this.marks.length == 0)
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

        if (window.markList.length == 0) {
            _markerNameSuffix = "A";
            this.$('#marks').html($._('No points defined'));
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
        //TODO: Use algorithm info for this
        } else if (window.markList.length < 2) {
            new MessageView({
               title: $._('Error'),
               message: $._('Not enough points defined.')
            }).render();
        } else {
            window.api.alg({
                alg: this.$('#algorithms').val(),
                points: window.markList.toJSON(),
                callback: function (text, success) {
                    if (success) {
                        window.mapModel.set({
                            route: text
                        });
                    }
                }
            });
        }
    },

    onClear: function () {
        var mapObject = window.mapModel.get("mapObject");
        window.markList.deleteAllMarks();
        window.mapModel.setRoute("");
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
        for (i in this.marks)
            this.marks[i].render();
    }
});


window.MapView = Backbone.View.extend({

    id: 'map',

    initialize: function (args) {
        $(window).resize(_.bind(this.onResize, this));
        args.sidebar.bind("resize", this.onSidebarResize);

        window.mapModel.bind("change:route", this.onRouteChange);
        window.markList.bind("all", this.onMarkListChange);
    },

    render: function () {
        $('#main').append(this.el);

        this.onResize(this.options.sidebar);

        var mapObject = window.mapModel.get("mapObject");
        mapObject.draw();
        setContextMenu();
        mapObject.refresh();

        // Move the attribution stuff to a readable position
        $('.olControlAttribution').css({
            right: '5px',
            top: '5px'
        });

        return this;
    },

    onRouteChange: function (model, route) {
        var mapObject = window.mapModel.get("mapObject");
        mapObject.resetRoute();
        mapObject.drawRoute(route);
        mapObject.zoomToRoute();
    },

    onMarkListChange: function (model, markList) {
        var mapObject = window.mapModel.get("mapObject");
        mapObject.resetMarkers();
        mapObject.drawMarkers(markList);
    },

    onResize: function (sidebar) {
        var width = 0;
        try {
            width = $(sidebar.el).outerWidth();
        } catch (e) {
            width = $(window.body.main.sidebar.el).outerWidth();
        }

        $(this.el).height($(window).height() - 40);
        $(this.el).width($(window).width() - $('#main #sidebar').width());
        $(this.el).css("left", $('#main #sidebar').width());
    },

    onSidebarResize: function (event, ui) {
        $("#main #map").css('left', ui.size.width);
        $("#main #map").css('width', "100%");
        $("#main #map").css('height', "100%");
        window.mapModel.get("mapObject").refresh();
    }
});

window.DataView = Backbone.View.extend({

    id: 'data',

    /**
     * Used to save the old size (before minimizing). Using this, we can restore the old size.
     */
    oldStyle: "",

    events: {
        "click span.minmax a": "onMinMax"
    },

    initialize: function () {
        window.mapModel.bind("change:dataViewText", _.bind(this.onDataViewChange, this));
    },

    render: function () {
        $(this.el).html(_.template(templates.dataView));
        $('#main').append(this.el);

        $(this.el).resizable({
            handles: "n, nw, w"
        });

        return this;
    },

    onDataViewChange: function (model, marker) {
        var that = this;
        var lonlat = window.mapModel.get("mapObject").transformTo1984(marker.get("lonlat"));
        this.$('.content').html(_.template(templates.dataViewContent, {lonlat:  lonlat, marker: marker}));
        this.$('#dataview #saveMarkAttributes').click(function () {
            marker.set({
                name: that.$('#dataview #markerName').val()
            });
            marker.set({
                k: that.$('#dataview #markerK').val()
            });
            var pos = that.$('#dataview #markerPos').val();
            window.markList.moveMark(marker, pos);
        });

        this.$('#dataview #deleteMark').click(function () {
            window.markList.deleteMark(marker);
            that.$('.content').html($._("No Mark selected"));
        });
    },

    onMinMax: function () {
        this.el.toggleClass('minimized');
        this.$('.content').toggle();

        var link = this.$('.minmax a');
        if (link.html() === '_') {
            link.html($._('Data'));

            this.oldStyle = this.el.attr('style');
            this.el.attr('style', '');
        } else {
            link.html('_');

            this.el.attr('style', this.oldStyle);
        }
    }
});

var _markerNameSuffix = "A";

window.MarkView = Backbone.View.extend({

    el: null,
    model: null,

    initialize: function () {
        this.template = _.template('<div id="mark_<%=cid%>" class="mark"><a href="#" class="view"><%=name%></a> <%=position%></div>');

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
        if (this.model.get('position') == 0)
            position = '(' + $._('Start') + ')';
        else if (this.model.get('position') == window.markList.length - 1)
            position = '(' + $._('Target') + ')';

        $('#marks').append(this.template({cid: this.model.cid, name: this.name, position: position}));
        this.el = $('#mark_'+this.model.cid);

        this.$('a.view').click(_.bind(this.onClick, this));

        return this;
    },

    remove: function () {
        $(this.el).remove();
    },

    onClick: function () {
        window.mapModel.setDataViewMarker(this.model);
    }
});

window.LoginView = Backbone.View.extend({

    id: 'login',
    className: 'modal',

    events: {
        "hidden": "remove",
        "click .modal-footer a.login": "onSubmitClick",
        "click .modal-footer a.cancel": "remove"
    },

    initialize: function () {
        window.app.user.bind('login', _.bind(this.onLoginSuccess, this));
    },

    render: function () {
        $(this.el).html(_.template(templates.loginView));

        var that = this;
        this.validator = this.$('form').validate({
            rules: {
                email: {
                    required: true,
                    email: true
                },
                password: "required"
            },
            showErrors: function (errorMap, errorList) {
                for (obj in errorList) {
                    $(errorList[obj].element).addClass('error')
                        .removeClass('valid')
                        .attr('rel', 'popover')
                        .attr('data-content', errorList[obj].message)
                        .attr('data-original-title', $._("Error!"))
                        .popover();
                }
                this.defaultShowErrors();
            },
            errorPlacement: function () {},
            highlight: function () {},
            unhighlight: function (elem, error, valid) {
                $(elem).addClass('valid')
                    .removeClass('error')
                    .attr('rel', null)
                    .attr('data-content', null)
                    .attr('data-original-title', null);
            },
            submitHandler: _.bind(that.onLogin, that),
            invalidHandler: function () {
                that.$('.error-empty').show();
            }
        });

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
        window.app.navigate('');
    },

    onSubmitClick: function () {
        this.$('form').submit();
    },

    onLogin: function () {
        this.loading = new LoadingView($._('Logging in')).render();

        // Clear old error messages first
        this.$('.alert-message').hide();

        var email = this.$('input#email').val();
        var password = this.$('input#password').val();

        window.app.user.login(email, password);
    },

    onLoginSuccess: function (success) {
        if (!_.isUndefined(this.loading) && !_.isNull(this.loading))
            this.loading.remove();

        if (success) {
            this.remove();
        } else if ($(this.el).length > 0 || $(this.el).css('display') !== 'none') {
            this.$('.error-correct').show();
        }
    }
});

window.RegisterView = Backbone.View.extend({

    id: 'register',
    className: 'modal',

    events: {
        "hidden": "remove",
        "click .modal-footer a.register": "onRegister",
        "click .modal-footer a.cancel": "remove"
    },

    render: function () {
        $(this.el).html(_.template(templates.registerView));

        var that = this;
        this.validator = this.$('form').validate({
            rules: {
                firstname: "required",
                lastname: "required",
                password: {
                    required: true,
                    minlength: 5
                },
                repeat_password: {
                    equalTo: '#register #password'
                },
                email: {
                    required: true,
                    email: true
                }
            },
            showErrors: function (errorMap, errorList) {
                for (obj in errorList) {
                    $(errorList[obj].element).addClass('error')
                        .removeClass('valid')
                        .attr('rel', 'popover')
                        .attr('data-content', errorList[obj].message)
                        .attr('data-original-title', $._("Error!"))
                        .popover();
                }
                this.defaultShowErrors();
            },
            errorPlacement: function () {},
            highlight: function () {},
            unhighlight: function (elem, error, valid) {
                $(elem).addClass('valid')
                    .removeClass('error')
                    .attr('rel', null)
                    .attr('data-content', null)
                    .attr('data-original-title', null);
            },
            submitHandler: _.bind(this.onSubmit, that),
            invalidHandler: function () {
                that.$('.error-correct').show();
            }
        });

        $(this.el).modal({
            show: true,
            backdrop: 'static',
            keyboard: true
        });
        return this;
    },

    remove: function () {
        if ($(this.el).modal(true).isShown)
            $(this.el).modal('hide');

        $(this.el).remove();
        window.app.navigate('');
    },

    onSubmit: function () {
        this.loading = new LoadingView($._("Sending data")).render();
        this.$('.error-correct').hide();

        var user = window.app.user;
        user.set({
            firstname: this.$('#firstname').val(),
            lastname: this.$('#lastname').val(),
            address: this.$('#address').val(),
            email: this.$('#email').val(),
            password: this.$('#password').val()
        });
        user.register({
            success: function () {
                this.loading.remove();
                this.remove();
                new MessageView({
                    title: $._("Registration successful"),
                    message: $._("The registration was successful. Please wait until an administrator activates your account.")
                }).render();
            },
            error: function (text) {
                this.loading.remove();
                //TODO: Parse error message and display errors
                new MessageView({
                   title: $._('Error!'),
                   message: text
                }).render();
            }
        });
    },

    onRegister: function () {
        this.$('form').submit();
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
        $(this.el).html(_.template(templates.messageView, {title: this.title, message: this.message}));

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
        $(this.el).html(_.template(templates.loadingView, {message: this.message}));

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
