window.BodyView = Backbone.View.extend({
    el: $('body'),

    events: {
        "click": "onBodyClick"
    },

    initialize: function() {
        this.topbar = new TopbarView();
        this.main = new MainView();
    },

    onBodyClick: function() {
        this.topbar.hideDropdown();
    }
});

window.TopbarView = Backbone.View.extend({

    el: $('header'),

    events: {
        "click a.menu": "showDropdown"
    },

    initialize: function() {
        window.app.user.bind('login', this.onLogin, this);
        this.$('ul li.menu, ul li.user').each(function() {
            $(this).css('display', 'block').hide();
        });
    },

    hideDropdown: function() {
        this.$('li.menu').removeClass('open');
    },

    showDropdown: function() {
        this.$('li.menu').toggleClass('open');
        return false; // Return false stops the click event from propagating (for example to the body event)
    },

    onLogin: function(login) {
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

    initialize: function() {
        this.sidebar = new SidebarView();
        this.map = new MapView({ sidebar: this.sidebar });
        this.data = new DataView();
    }
});

window.SidebarView = Backbone.View.extend({

    el: $('#main #sidebar'),

    initialize: function() {
        this.onResize();

        $(window).resize(_.bind(this.onResize, this));
        this.el.resizable({
            handles: 'e'
        })

	window.mapModel.bind("change:startMark", function(model, startMark) {
		$('#main #sidebar #start').val(startMark.lon + "," + startMark.lat);
	});

	window.mapModel.bind("change:targetMark", function(model, targetMark) {
		$('#main #sidebar #target').val(targetMark.lon + "," + targetMark.lat);
	});
    },

    onResize: function() {
        this.el.height($(window).height() - 40);
    }
});


window.MapView = Backbone.View.extend({

    el: $('#main #map'),
    initialize: function(args) {
        this.onResize(args.sidebar);
        $(window).resize(_.bind(this.onResize, this));
	// update map size when resize sidebar
	var resizeUpdater = function(event, ui) {
		$("#main #map").css('left', ui.size.width);
		$("#main #map").css('width', "100%");
		$("#main #map").css('height', "100%");
		mapObject.refresh();
	};
	$("#main #sidebar").bind("resize", resizeUpdater);

	var mapObject = window.mapModel.get("mapObject");
	mapObject.draw();
	setContextMenu();

	window.mapModel.bind("change:route", function(model, route) {
		mapObject.drawRoute(route);
        });

        mapObject.refresh();
    },

    onResize: function(sidebar) {
        var width = 0;
        try {
            width = sidebar.el.outerWidth();
        } catch (e) {
            width = window.body.main.sidebar.el.outerWidth();
        }
        this.el.height($(window).height() - 40);
        this.el.width($(window).width());
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

    initialize: function() {
        this.el.resizable({
           handles: "n, nw, w"
        });
	window.mapModel.bind("change:dataViewText", function(model, text) {
		$('#main #data .content').text(text);
	});
    },

    onMinMax: function() {
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
        "click .modal-footer a.login": "onLogin",
        "click .modal-footer a.cancel": "remove"
    },

    initialize: function() {
        window.app.user.bind('login', _.bind(this.onLoginSuccess, this));
    },

    render: function() {
        this.el.modal({
            show: true,
            backdrop: 'static',
            keyboard: false
        });
        return this;
    },

    remove: function() {
        this.el.modal('hide');
    },

    onLogin: function() {
        // Clear old error messages first
        this.$('.alert-message').hide();

        var email = this.$('input#email').val();
        var password = this.$('input#password').val();
        if (email.length < 1 || password.length < 1) {
            log('Invalid data');
            this.$('.error-empty').show();
            return;
        }

        window.app.user.login(email, password);
    },

    onLoginSuccess: function(success) {
        if (success) {
            this.remove();
        } else if (this.el.css('display') !== 'none') {
            this.$('.error-correct').show();
        }
    },

    onClose: function() {
        this.$('input').each(function() {
            $(this).val('');
        });

        this.$('.alert-message').hide();
        window.app.navigate('');
    }
});

window.RegisterView = Backbone.View.extend({

    el: $('#register'),

    events: {
        "hidden" : "onClose",
        "click .modal-footer a.register": "onRegister",
        "click .modal-footer a.cancel": "remove"
    },

    initialize: function() {
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
            showErrors: function(errorMap, errorList) {               
                for (obj in errorList) {
                    $(errorList[obj].element).addClass('error')
                        .removeClass('valid')
                        .attr('rel', 'popover')
                        .attr('data-content', errorList[obj].message)
                        .attr('data-original-title', "Error!")
                        .popover();
                }
                this.defaultShowErrors();
            },
            errorPlacement: function() { },
            highlight: function() { },
            unhighlight: function(elem, error, valid) {
                $(elem).addClass('valid').removeClass('error')
                        .attr('rel', null).attr('data-content', null)
                        .attr('data-original-title', null);
            },
            submitHandler: function(form) {
                that.loading = new LoadingView();
                that.loading.show("Sending data");
                that.$('.error-correct').hide();
                
                var user = window.app.user;
                user.set({
                    firstname: that.$('#firstname').val(),
                    lastname: that.$('#lastname').val(),
                    address: that.$('#address').val(),
                    email: that.$('#email').val(),
                    password: that.$('#password').val()
                });
                user.register({
                    success: function() {
                        that.loading.remove();
                        that.remove();
                        new MessageView().show({
                            title: "Success",
                            message: "The registration was successful. Please wait until an administrator activates your account."
                        });
                    },
                    error: function(text) {
                        that.loading.remove();
                        //TODO: Parse error message and display errors
                        alert('Error: ' + text);
                    }
                });
            },
            invalidHandler: function() {
                that.$('.error-correct').show();
            }
        })
    },

    render: function() {
        this.el.modal({
            show: true,
            backdrop: 'static',
            keyboard: true
        });
        return this;
    },

    remove: function() {
        this.el.modal('hide');
    },

    onClose: function() {
        this.$('input, textarea').each(function() {
            $(this).val('');
            $(this).removeClass('error valid');
        });

        this.$('.alert-message').hide();
        this.validator.resetForm();
        window.app.navigate('');
    },

    onRegister: function() {
        this.$('form').submit();
    }
});

window.MessageView = Backbone.View.extend({
   
    el: $('#message'),
    
    events: {
        "click .modal-footer a.cancel": "remove"
    },
   
    render: function() {
        this.el.modal({
            show: true,
            backdrop: 'static',
            keyboard: false
        });        
        return this;
    },
    
    show: function(args) {
        if (_.isUndefined(args))
            return;
        this.title = args.title || "";
        this.message = args.message || "";
        
        this.$('.title').html(this.title);
        this.$('.message').html(this.message);
        
        this.render();
    },
    
    remove: function() {
        this.el.modal('hide');
    }
});

window.LoadingView = Backbone.View.extend({
   
    el: $('#loading'),
   
    render: function() {
        this.el.modal({
            show: true,
            backdrop: 'static',
            keyboard: false
        });
        return this;
    },
    
    show: function(message) {
        this.message = message || "";        
        this.$('.message').html(this.message);        
        this.render();
    },
   
    remove: function() {
        this.el.modal('hide');
    }
});
