window.BodyView = Backbone.View.extend({
    el: $('body'),

    events: {
        "click": "onBodyClick"
    },

    initialize: function () {
        this.topbar = new TopbarView();
        this.main = new MainView();
    },

    onBodyClick: function () {
        this.topbar.hideDropdown();
    }
});

window.TopbarView = Backbone.View.extend({

    el: $('header'),

    events: {
        "click a.menu": "showDropdown"
    },

    initialize: function () {
        window.app.user.bind('login', this.onLogin, this);
        this.$('ul li.menu, ul li.user').each(function () {
            $(this).css('display', 'block').hide();
        });
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
        } else {
            this.$('li.user, li.menu').hide();
            this.$('li.login-link, li.register-link').show();
        }
    }

});

window.MainView = Backbone.View.extend({

    el: $('#main'),

    initialize: function () {
        this.sidebar = new SidebarView();
        this.map = new MapView({
            sidebar: this.sidebar
        });
        this.data = new DataView();
    }
});

window.SidebarView = Backbone.View.extend({

    el: $('#main #sidebar'),

    events: {
        "click #btnClear": "onClear",
        "click #btnSend": "onSend"
    },

    initialize: function () {
        this.onResize();

        $(window).resize(_.bind(this.onResize, this));
        this.el.resizable({
            handles: 'e'
        });

        window.server.bind("info-loaded", _.bind(this.onInfoLoaded, this));
    },

    onInfoLoaded: function () {
        var algorithms = window.server.get('algorithms');
        var $algorithms = this.$('#algorithms');
        
        if (!_.isUndefined(algorithms) && algorithms.length > 0) {
            $algorithms.children().remove();
            for (i in algorithms) {
                $algorithms.append('<option value="' + algorithms[i].urlsuffix + '">' + algorithms[i].name + '</option>');
            }
        }
    },

    onSend: function () {
        var alg = this.$('#algorithms').val();
        if (_.isUndefined(alg) || _.isEmpty(alg))  {
            new MessageView().show({
                title: 'Error',
                message: 'No algorithm selected.'
            });
        } else {        
            window.api.alg({
                alg: this.$('#algorithms').val(),
                request: window.markList.getJSON(),
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
        this.el.height($(window).height() - 40);
    }
});


window.MapView = Backbone.View.extend({

    el: $('#main #map'),

    initialize: function (args) {
        this.onResize(args.sidebar);
        $(window).resize(_.bind(this.onResize, this));
        args.sidebar.bind("resize", this.onSidebarResize);

        var mapObject = window.mapModel.get("mapObject");
        mapObject.draw();
        setContextMenu();

        window.mapModel.bind("change:route", this.onRouteChange);
        window.markList.bind("all", this.onMarkListChange);

        mapObject.refresh();

        // Move the attribution stuff to a readable position
        $('.olControlAttribution').css({
            right: '5px',
            top: '5px'
        });
    },

    onRouteChange: function (model, route) {
        var mapObject = window.mapModel.get("mapObject");
        mapObject.resetRoute();
        mapObject.drawRoute(route);
    },

    onMarkListChange: function (model, markList) {
        var mapObject = window.mapModel.get("mapObject");
        mapObject.resetMarkers();
        mapObject.drawMarkers(markList);

        if (window.markList.getStartMark() != null) {
            $('#main #sidebar #start').val(window.markList.getStartMark().getLonLatAs1984());
        } else {
            $('#main #sidebar #start').val("");
        }

        if (window.markList.getTargetMark() != null) {
            $('#main #sidebar #target').val(window.markList.getTargetMark().getLonLatAs1984());
        } else {
            $('#main #sidebar #target').val("");
        }

    },

    onResize: function (sidebar) {
        var width = 0;
        try {
            width = sidebar.el.outerWidth();
        } catch (e) {
            width = window.body.main.sidebar.el.outerWidth();
        }

        this.el.height($(window).height() - 40);
        this.el.width($(window).width() - $('#main #sidebar').width());
        this.el.css("left", $('#main #sidebar').width());
    },

    onSidebarResize: function (event, ui) {
        $("#main #map").css('left', ui.size.width);
        $("#main #map").css('width', "100%");
        $("#main #map").css('height', "100%");
        window.mapModel.get("mapObject").refresh();
    }
});

window.DataView = Backbone.View.extend({

    el: $('#main #data'),

    /**
     * Used to save the old size (before minimizing). Using this, we can restore the old size.
     */
    oldStyle: "",

    events: {
        "click span.minmax a": "onMinMax"
    },

    initialize: function () {
        this.el.resizable({
            handles: "n, nw, w"
        });
        window.mapModel.bind("change:dataViewText", this.onDataViewChange);
    },

    onDataViewChange: function (model, marker) {
        var lonlat = window.mapModel.get("mapObject").transformTo1984(marker.get("lonlat"));
        $('#main #data .content').html("<b>Lon:</b> " + lonlat.lon + "<br>" + "<b>Lat:</b> " + lonlat.lat + "<br>" + "<b>Name:</b> " + "<input type='text' id='markerName' value='" + marker.get("name") + "' />" + "<br>" + "<b>Position:</b> " + "<input type='text' id='markerPos' value='" + window.markList.indexOfMark(marker) + "' />" + "<br>" + "<b>k:</b> " + "<input type='text' id='markerK' value='" + marker.get("k") + "' />" + "<br>" + "<button id='saveMarkAttributes' class='btn primary'>Übernehmen</button><button id='deleteMark' class='btn secondary'>Löschen</button>");

        $('#main #data #dataview #saveMarkAttributes').click(function () {
            marker.set({
                name: $('#main #data #dataview #markerName').val()
            });
            marker.set({
                k: $('#main #data #dataview #markerK').val()
            });
            var pos = $('#main #data #dataview #markerPos').val();
            window.markList.moveMark(marker, pos);
            alert("Übernommen!");
        });

        $('#main #data #dataview #deleteMark').click(function () {
            window.markList.deleteMark(marker);
            $('#main #data .content').html("No Mark selected");
        });
    },

    onMinMax: function () {
        this.el.toggleClass('minimized');
        this.$('.content').toggle();

        var link = this.$('.minmax a');
        if (link.html() === '_') {
            link.html('Daten');

            this.oldStyle = this.el.attr('style');
            this.el.attr('style', '');
        } else {
            link.html('_');

            this.el.attr('style', this.oldStyle);
        }
    }
});

window.LoginView = Backbone.View.extend({

    el: $('#login'),

    events: {
        "hidden": "onClose",
        "click .modal-footer a.login": "onSubmitClick",
        "click .modal-footer a.cancel": "remove"
    },

    initialize: function () {
        window.app.user.bind('login', _.bind(this.onLoginSuccess, this));

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
                    $(errorList[obj].element).addClass('error').removeClass('valid').attr('rel', 'popover').attr('data-content', errorList[obj].message).attr('data-original-title', "Error!").popover();
                }
                this.defaultShowErrors();
            },
            errorPlacement: function () {},
            highlight: function () {},
            unhighlight: function (elem, error, valid) {
                $(elem).addClass('valid').removeClass('error').attr('rel', null).attr('data-content', null).attr('data-original-title', null);
            },
            submitHandler: _.bind(this.onLogin, that),
            invalidHandler: function () {
                that.$('.error-empty').show();
            }
        });
    },

    render: function () {
        this.el.modal({
            show: true,
            backdrop: 'static',
            keyboard: false
        });
        return this;
    },

    remove: function () {
        this.el.modal('hide');
    },

    onSubmitClick: function () {
        this.$('form').submit();
    },

    onLogin: function () {
        // Clear old error messages first
        this.$('.alert-message').hide();

        var email = this.$('input#email').val();
        var password = this.$('input#password').val();

        window.app.user.login(email, password);
    },

    onLoginSuccess: function (success) {
        if (success) {
            this.remove();
        } else if (this.el.css('display') !== 'none') {
            this.$('.error-correct').show();
        }
    },

    onClose: function () {
        this.$('input').each(function () {
            $(this).val('');
        });

        this.validator.resetForm();
        this.$('.alert-message').hide();
        window.app.navigate('');
    }
});

window.RegisterView = Backbone.View.extend({

    el: $('#register'),

    events: {
        "hidden": "onClose",
        "click .modal-footer a.register": "onRegister",
        "click .modal-footer a.cancel": "remove"
    },

    initialize: function () {
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
                    $(errorList[obj].element).addClass('error').removeClass('valid').attr('rel', 'popover').attr('data-content', errorList[obj].message).attr('data-original-title', "Error!").popover();
                }
                this.defaultShowErrors();
            },
            errorPlacement: function () {},
            highlight: function () {},
            unhighlight: function (elem, error, valid) {
                $(elem).addClass('valid').removeClass('error').attr('rel', null).attr('data-content', null).attr('data-original-title', null);
            },
            submitHandler: _.bind(this.onSubmit, that),
            invalidHandler: function () {
                that.$('.error-correct').show();
            }
        })
    },

    render: function () {
        this.el.modal({
            show: true,
            backdrop: 'static',
            keyboard: true
        });
        return this;
    },

    remove: function () {
        this.el.modal('hide');
    },

    onClose: function () {
        this.$('input, textarea').each(function () {
            $(this).val('');
            $(this).removeClass('error valid');
        });

        this.$('.alert-message').hide();
        this.validator.resetForm();
        window.app.navigate('');
    },

    onSubmit: function () {
        this.loading = new LoadingView();
        this.loading.show("Sending data");
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
                new MessageView().show({
                    title: "Success",
                    message: "The registration was successful. Please wait until an administrator activates your account."
                });
            },
            error: function (text) {
                this.loading.remove();
                //TODO: Parse error message and display errors
                alert('Error: ' + text);
            }
        });
    },

    onRegister: function () {
        this.$('form').submit();
    }
});

window.MessageView = Backbone.View.extend({

    el: $('#message'),

    events: {
        "click .modal-footer a.cancel": "remove"
    },

    render: function () {
        this.el.modal({
            show: true,
            backdrop: 'static',
            keyboard: false
        });
        return this;
    },

    show: function (args) {
        if (_.isUndefined(args)) return;
        this.title = args.title || "";
        this.message = args.message || "";

        this.$('.title').html(this.title);
        this.$('.message').html(this.message);

        this.render();
    },

    remove: function () {
        this.el.modal('hide');
    }
});

window.LoadingView = Backbone.View.extend({

    el: $('#loading'),

    render: function () {
        this.el.modal({
            show: true,
            backdrop: 'static',
            keyboard: false
        });
        return this;
    },

    show: function (message) {
        this.message = message || "";
        this.$('.message').html(this.message);
        this.render();
    },

    remove: function () {
        this.el.modal('hide');
    }
});
