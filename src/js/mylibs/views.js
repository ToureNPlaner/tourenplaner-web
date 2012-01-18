var _markerNameSuffix = "A";

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
        "click a.menu": "showDropdown",
        "submit form": "onSearchSubmit"
    },

    initialize: function () {
        window.app.user.bind('login', this.onLogin, this);
    },

    render: function () {
        $(this.el).html(templates.topbarView);
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

    onSearchSubmit: function (evt) {
        if (!window.nomApi)
            window.nomApi = new Nominatim();

        var s = this.$('form input[type=text]').val(),
            that = this;
        nomApi.search(s, function (success, data) {
            var spot = null;
            for (var i in data) {
                if (data[i]["class"] == "place") {
                    spot = data[i];
                    break;
                }
            }

            if (_.isNull(spot)) {
                new MessageView({title: "Error!", message: "Couldn't find the spot"}).render();
                return;
            }

            window.map.setCenter({lon: spot.lon, lat: spot.lat}, spot.boundingbox);
        });

        evt.preventDefault();
        return false;
    },

    onLogin: function (login) {
        var user = window.app.user;

        if (user.isLoggedIn()) {
            this.$('li.user a').html(user.get('firstname') + ' ' + user.get('lastname'));
            this.$('li.user, li.menu').show();

            if (user.get('admin'))
                this.$('li.menu ul li.admin').show();
        } else {
            this.$('li.user, li.menu').hide();
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
                if (!algorithms[i].hidden)
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
        } else if (window.markList.length < window.guiModel.getCurrentAlgorithm().constraints.minPoints) {
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
                        window.map.drawRoute(text);
                        if (!_.isUndefined(text.requestid))
                            window.app.navigate('/route/' + text.requestid);
                    }
                }
            });
        }
    },

    onClear: function () {
        var mapObject = window.map;
        window.markList.deleteAllMarks();
        window.map.drawRoute("");
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


window.MapView = Backbone.View.extend({

    id: 'map',

    initialize: function (args) {
        $(window).resize(_.bind(this.onResize, this));
        args.sidebar.bind("resize", this.onSidebarResize);

        
        window.markList.bind("add", this.onMarkListChange);
        window.markList.bind("change:lonlat", this.onMarkListChange);
        window.markList.bind("remove", this.onMarkListChange);
        window.markList.bind("reset", this.onMarkListChange);
    },

    render: function () {
        $('#main').append(this.el);

        this.onResize(this.options.sidebar);

        var mapObject = window.map;
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


    onMarkListChange: function (model, markList) {
        var mapObject = window.map;
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
        window.map.refresh();
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
        window.guiModel.bind("change:dataViewText", _.bind(this.onDataViewChange, this));
    },

    render: function () {
        $(this.el).html(templates.dataView);
        $('#main').append(this.el);

        $(this.el).resizable({
            handles: "n, nw, w"
        });

        return this;
    },
    
    testFkt: function() {
    
    	alert("SChon stier he");
    },
    
     onDataViewChange: function (model, marker) {
        var that = this;
        var lonlat = window.map.transformTo1984(marker.get("lonlat"));
        // get all pointconstraints for currently selected algorithm
        var pointconstraints = window.guiModel.getCurrentAlgorithm().pointconstraints;

        // add fields to edit pointconstraints
        var constraintsHtml = "", key;
        for (var i = 0; i < pointconstraints.length; i++) {
			key = pointconstraints[i].name;

			var value = "";
			if (!_.isUndefined(marker.get(key))) {
				value = marker.get(key);
			}
			
			constraintsHtml += "<div class='clearfix'><label for='pc_" + key + "'><b>" + key + ":</b></label>";
			if (pointconstraints[i].type == "boolean") {
				// display a checkbox and set its checked state
				var checked = "";
				if (value == true) {
					checked = "checked";
				}
				constraintsHtml += "<input type='checkbox' name='pc_" + key + "' id='pc_" + key + "' " + checked + "/></div>";
			} else {
				// display numberinputs for int, float, meter and price
				switch (pointconstraints[i].type) {
					case "integer":
							constraintsHtml += "<input value='"+value+"' type='text' class='smartspinner' name='pc_" + key + "' id='pc_" + key + "' /></div>";
						break;
					case "float":
							constraintsHtml += "<input value='"+value+"' type='text' class='smartspinner' name='pc_" + key + "' id='pc_" + key + "' /></div>";
						break;
					case "meter":
							constraintsHtml += "<input value='" + value + "' type='text' class='smartspinner' name='pc_" + key + "' id='pc_" + key + "' /> m</div>";
						break;
					case "price":
							constraintsHtml += "<input value='"+value+"' type='text' class='smartspinner' name='pc_" + key + "' id='pc_" + key + "' /> &#8364;</div>";
						break;
				}
			}
		}
		
	
        var data = {
            lonlat:  lonlat,
            marker: marker.toJSON(),
            constraints: !_.isEmpty(constraintsHtml),
            constraintsHtml: constraintsHtml
        };
        
        this.$('.content').html(templates.dataViewContent(data));
	
		// initialize Spinners
		for (i = 0; i < pointconstraints.length; i++) {
			key = pointconstraints[i].name;
			
			var initValue = this.$('#dataview #pc_' + key).val();
			this.$('#dataview #pc_' + key).spinit({height: 30, initValue: initValue, min: pointconstraints[i].min, max: pointconstraints[i].max});
		}
	

        this.$('#dataview #saveMarkAttributes').click(function () {
            marker.set({
                name: that.$('#dataview #markerName').val()
            });

			if (!_.isNull(pointconstraints)) {
				for (var i = 0; i < pointconstraints.length; i++) {
					var key = pointconstraints[i].name;
					// marker.set({key : value}) doesnt use the value of key.
					// instead the keys name will be "key".
					// so this is used as an alternative:
					if (!_.isEmpty(that.$('#dataview #pc_' + key).val())) {
						var value = that.$('#dataview #pc_' + key).val();
						
						if (pointconstraints[i].type == "boolean") {
							if (that.$('#dataview #pc_' + key).attr('checked')) {
								value = true;
							} else {
								// this is needed, because attr would be "undefined"
								// if the checkbox isn't checked.
								value = false;
							}
						} 
						marker.attributes[key] = value;
					} else {
						// if nothing is written in to that pointconstraint, then set
						// it to undefined, so we can later check if it's set or not.
						marker.attributes[key] = undefined;
					}
				}
			}

            var pos = that.$('#dataview #markerPos').val();
            window.markList.moveMark(marker, pos);
        });

        this.$('#dataview #deleteMark').click(function () {
            window.markList.deleteMark(marker);
            that.$('.content').html($._("No point selected!"));
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

window.LoginView = Backbone.View.extend({

    id: 'login',
    className: 'modal',

    events: {
        "click .modal-footer a.login": "onSubmitClick",
        "click .modal-footer a.register": "onRegisterClick",
        "keydown": "onKeydown"
    },

    initialize: function () {
        window.app.user.bind('login', _.bind(this.onLoginSuccess, this));
    },

    render: function () {
        $(this.el).html(templates.loginView);

        var that = this;
        this.validator = this.$('form').validate({
            rules: {
                email: {
                    required: true,
                    email: true
                },
                password: "required"
            },
            messages: {
                email: {
                    required: $._('Please enter a valid email address'),
                    email: $._('Please enter a valid email address')
                },
                password: $._('Please enter your password')
            },
            showErrors: function (errorMap, errorList) {
                for (var obj in errorList) {
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
        $(this.el).modal('hide');
        $(this.el).remove();
        window.app.user.unbind('login', _.bind(this.onLoginSuccess, this));

        if (window.location.hash === '#/login')
            window.app.navigate('');
    },

    onSubmitClick: function () {
        this.$('form').submit();
    },

    onRegisterClick: function () {
        this.remove();
    },

    onKeydown: function (evt) {
        if (evt.keyCode == '13') // Return pressed
            this.$('.modal-footer a.login').click();
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
        "click .modal-header a.close": "onRemove",
        "click .modal-footer a.register": "onRegister",
        "click .modal-footer a.cancel": "onRemove",
        "keydown": "onKeydown"
    },

    render: function () {
        $(this.el).html(templates.registerView);

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
                    required: true,
                    minlength: 5,
                    equalTo: '#password'
                },
                email: {
                    required: true,
                    email: true
                }
            },
            messages: {
                firstname: $._('Please enter your firstname'),
                lastname: $._('Please enter your lastname'),
                password: {
                    required: $._('Please provide a password'),
                    minlength: $._('Enter at least 5 characters')
                },
                repeat_password: {
                    required: $._('Please repeat your password'),
                    minlength: $._('Enter at least 5 characters'),
                    equalTo: $._('Enter the same password as above')
                },
                email: {
                    required: $._('Please enter a valid email address'),
                    email: $._('Please enter a valid email address')
                }
            },
            showErrors: function (errorMap, errorList) {
                for (var obj in errorList) {
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
            submitHandler: _.bind(that.onSubmit, that),
            invalidHandler: function () {
                that.$('.error-correct').show();
            }
        });

        $(this.el).modal({
            show: true,
            backdrop: 'static',
            keyboard: false
        });
        $(this.el).undelegate('.close', 'click.modal');
        return this;
    },

    remove: function () {
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
    },

    onRemove: function () {
        this.remove();
        window.app.navigate('/login', true);
    },

    onKeydown: function (evt) {
        if (!$(evt.target).is('textarea') && evt.keyCode == '13')
            this.$('.modal-footer a.register').click();
    }
});

window.AdminView = Backbone.View.extend({

    id: 'admin',
    className: 'modal',

    events: {
        "hidden": "remove",
        "click .cancel": "remove",
        "click .back": "onBack"
    },

    render: function () {
        var content = templates.adminMainView;
        this.content = null;

        $(this.el).html(templates.adminView({content: content}));
        $(this.el).modal({
            show: true,
            keyboard: true,
            backdrop: 'static'
        });

        this.renderMainView();

        return this;
    },

    renderMainView: function () {
        if (_.isUndefined(this.position)) {
            this.position = {
                limit: 10,
                offset: 0
            };
        }

        loadingView = new LoadingView('Loading table data').render();

        var that = this;
        api.listUsers({
            limit: this.position.limit,
            offset: this.position.offset,
            callback: function (text, success) {
                if (success && _.isNull(that.content)) {
                    var page = (that.position.offset / that.position.limit) + 1;
                    var pages = text.number / that.position.limit;

                    // Update table
                    that.$('tbody').html('');
                    for (var i in text.requests)
                        that.$('tbody').append(templates.adminTableRowView({user: text.requests[i]}));

                    that.$('tbody a.activate').each(function () {
                        var i = $(this).parents('tr').index();
                        $(this).click(_.bind(that.onActivateClick, that, text.requests[i]));
                    });
                    that.$('tbody a.delete').each(function () {
                        var i = $(this).parents('tr').index();
                        $(this).click(_.bind(that.onDeleteClick, that, text.requests[i]));
                    });
                    that.$('tbody a.edit').each(function () {
                        var i = $(this).parents('tr').index();
                        $(this).click(_.bind(that.onEditClick, that, text.requests[i]));
                    });

                    // Update pagination
                    that.$('.pagination').remove();
                    var html = '', nums = [];
                    if (pages > 6) {
                        nums = _.range(1, 4);
                        nums.push('...');
                        nums = nums.concat(_.range(pages - 2, pages + 1));
                    } else if (pages > 1) {
                        nums = _.range(1, pages + 1);
                    } else {
                        nums = [1];
                    }

                    for (i in nums) {
                        html += '<li';
                        if (nums[i] === page)
                            html += ' class="active"';
                        else if (!_.isNumber(nums[i]))
                            html += ' class="disabled"';
                        html += '><a href="#">' + nums[i] + '</a></li>';
                    }

                    that.$('.modal-body').append(templates.paginationView({pages: html}));
                    that.$('.pagination').css({width: that.$('.pagination ul').outerWidth() + 'px'});

                    if (page !== 1)
                        that.$('.pagination li').first().removeClass('disabled');
                    if (page !== pages)
                        that.$('.pagination li').last().removeClass('disabled');

                    // Add events
                    that.$('.pagination li a').first().click(_.bind(that.onPrev, that));
                    that.$('.pagination li a').last().click(_.bind(that.onNext, that));
                    that.$('.pagination li a').each(function () {
                        var page = parseInt($(this).html());
                        if (_.isNumber(page))
                            $(this).click(_.bind(that.onPage, that, page));
                    });
                }
                loadingView.remove();
            }
        });
    },

    remove: function () {
        if ($(this.el).modal(true).isShown)
            $(this.el).modal('hide');
        if (_.isFunction(this.options.remove))
            this.options.remove();
        $(this.el).remove();
        window.app.navigate('');
    },

    setContent: function (content) {
        if (!_.isNull(this.content) && !_.isUndefined(this.content))
            this.content.remove();

        if (this.$('.modal-footer a.btn.back').css('display') === 'none')
            this.$('.modal-footer a.btn.back').show();

        this.$('.modal-body').html(content.el);
        this.content = content;
    },

    onBack: function () {
        this.content.remove();
        this.content = null;

        this.$('.modal-body').html(templates.adminMainView);
        this.renderMainView();
        this.$('.modal-footer a.btn.back').hide();

        window.app.navigate('/admin');
        return false;
    },

    onPrev: function () {
        if (this.position.offset === 0)
            return false;
        else if (this.position.offset - this.position.limit < 0)
            this.position.offset = 0;
        else
            this.position.offset -= this.position.limit;

        this.renderMainView();
        return false;
    },

    onNext: function () {
        this.position.offset += this.position.limit;

        this.renderMainView();
        return false;
    },

    onPage: function (page) {
        this.position.offset = this.position.limit * (page - 1);

        this.renderMainView();
        return false;
    },

    onActivateClick: function (user) {
        user.active = true;

        var that = this;
        api.updateUser({
            id: user.userid,
            userObject: user,
            callback: function (text, success) {
                that.renderMainView();
            }
        });
        return false;
    },

    onDeleteClick: function (user) {
        if (confirm($._('Do you really want to delete the user?'))) {
            var that = this;
            api.deleteUser({
                id: user.userid,
                callback: function (text, success) {
                    that.renderMainView();
                }
            });
        }
        return false;
    },

    onEditClick: function (user) {
        if (Modernizr.sessionstorage)
            sessionStorage.setItem('edit-user', JSON.stringify(user));

        window.app.navigate('/admin/user/' + user.userid, true);
        return false;
    }
});

window.BillingView = Backbone.View.extend({
    id: 'admin',
    className: 'modal',

    events: {
        "hidden": "remove",
        "click .modal-footer a.cancel": "remove"
    },
    render: function () {
        var content = templates.billingMainView;
        this.content = null;
        
        $(this.el).html(templates.billingView({content: content}));
        $(this.el).modal({
            show: true,
            keyboard: true,
            backdrop: 'static'
        });

        this.renderMainView();

        return this;
    },

    renderMainView: function () {
        if (_.isUndefined(this.position)) {
            this.position = {
                limit: 2,
                offset: 3
            };
        }
        loadingView = new LoadingView('Loading billing data').render();
        var that = this;
        api.listRequests({
            limit: this.position.limit,
            offset: this.position.offset,
            callback: function (text, success) {
                if (success && _.isNull(that.content)) {
                    var page = Math.floor((that.position.offset / that.position.limit) + 1);
                    var pages = text.number / that.position.limit;

                    // Update table
                    that.$('tbody').html('');
                    for (var i in text.requests){
                    	text.requests[i].request = JSON.stringify(text.requests[i].request);
                    	text.requests[i].response = JSON.stringify(text.requests[i].response);
                        that.$('tbody').append(templates.billingTableRowView({request: text.requests[i]}));
                        // add click handling (draw clicked route)
                        $('#billing-'+text.requests[i].requestid).click(function(){
                       		window.markList.deleteAllMarks();
                        	var request = jQuery.parseJSON($(this).closest('tr').children()[0].innerHTML);
                        	for(var j=0;j<request.points.length;j++){
								var m = new Mark();
								m.setLonLatWith1984(request.points[j].ln,request.points[j].lt);
								window.markList.appendMark(m);
                        	}
							var response = jQuery.parseJSON($(this).closest('tr').children()[1].innerHTML);
							window.map.drawRoute(response);
							that.remove();
						});
						
                    }
                   	 
                    // Update pagination
                    that.$('.pagination').remove();
                    var html = '', nums = [];
                    if (pages > 6) {
                        nums = _.range(1, 4);
                        nums.push('...');
                        nums = nums.concat(_.range(pages - 2, pages + 1));
                    } else if (pages > 1) {
                        nums = _.range(1, pages + 1);
                    } else {
                        nums = [1];
                    }

                    for (i in nums) {
                        html += '<li';
                        if (nums[i] === page)
                            html += ' class="active"';
                        else if (!_.isNumber(nums[i]))
                            html += ' class="disabled"';
                        html += '><a href="#">' + nums[i] + '</a></li>';
                    }

                    that.$('.modal-body').append(templates.paginationView({pages: html}));
                    that.$('.pagination').css({width: that.$('.pagination ul').outerWidth() + 'px'});
                    that.$('#billing').css({width: that.$('.modal-body').outerWidth() + 'px'});

                    if (page !== 1)
                        that.$('.pagination li').first().removeClass('disabled');
                    if (page !== pages)
                        that.$('.pagination li').last().removeClass('disabled');

                    // Add events
                    that.$('.pagination li a').first().click(_.bind(that.onPrev, that));
                    that.$('.pagination li a').last().click(_.bind(that.onNext, that));
                    that.$('.pagination li a').each(function () {
                        var page = parseInt($(this).html());
                        if (_.isNumber(page))
                            $(this).click(_.bind(that.onPage, that, page));
                    });
                }                    
            	loadingView.remove();
            }
        });
    },

    remove: function () {
        if ($(this.el).modal(true).isShown)
            $(this.el).modal('hide');
        if (_.isFunction(this.options.remove))
            this.options.remove();
        $(this.el).remove();
        window.app.navigate('');
    },

    setContent: function (content) {
        if (!_.isNull(this.content) && !_.isUndefined(this.content))
            this.content.remove();

        if (this.$('.modal-footer a.btn.back').css('display') === 'none')
            this.$('.modal-footer a.btn.back').show();

        this.$('.modal-body').html(content.el);
        this.content = content;
    },

    onPrev: function () {
        if (this.position.offset === 0)
            return false;
        else if (this.position.offset - this.position.limit < 0)
            this.position.offset = 0;
        else
            this.position.offset -= this.position.limit;

        this.renderMainView();
        return false;
    },

    onNext: function () {
        this.position.offset += this.position.limit;

        this.renderMainView();
        return false;
    },

    onPage: function (page) {
        this.position.offset = this.position.limit * (page - 1);

        this.renderMainView();
        return false;
    },
    
    onBack: function () {
        this.content.remove();
        this.content = null;

        this.$('.modal-body').html(templates.billingMainView);
        this.renderMainView();
        this.$('.modal-footer a.btn.back').hide();

        window.app.navigate('/billing');
        return false;
    }
});

window.UserView = Backbone.View.extend({

    id: 'admin-user',

    events: {
        "click a.save": "onSubmitClick"
    },

    render: function () {
        var user = {};
        if (!_.isUndefined(this.model) && !_.isNull(this.model))
            user = this.model.toJSON();

        $(this.el).html(templates.userView({user: user}));

        var that = this;
        this.validator = this.$('form').validate({
            rules: {
                firstname: "required",
                lastname: "required",
                password: {
                    minlength: 5
                },
                email: {
                    required: true,
                    email: true
                }
            },
            messages: {
                firstname: $._('Please enter a firstname'),
                lastname: $._('Please enter a lastname'),
                password: {
                    minlength: $._('Enter at least 5 characters')
                },
                email: {
                    required: $._('Please enter a valid email address'),
                    email: $._('Please enter a valid email address')
                }
            },
            showErrors: function (errorMap, errorList) {
                for (var obj in errorList) {
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
            submitHandler: _.bind(that.onSubmit, that),
            invalidHandler: function () {
                that.$('.error-correct').show();
            }
        });

        return this;
    },

    remove: function () {
        $(this.el).remove();
    },

    onSubmitClick: function () {
        this.$('form').submit();
        return false;
    },

    onSubmit: function () {
        var loading = new LoadingView($._("Sending data")).render();
        this.$('.error-correct').hide();

        var new_user = false;
        if (_.isUndefined(this.model) || _.isNull(this.model)) {
            new_user = true;
            this.model = new User();
        }

        var user = this.model;
        user.set({
            firstname: this.$('#firstname').val(),
            lastname: this.$('#lastname').val(),
            address: this.$('#address').val(),
            email: this.$('#email').val(),
            active: this.$('#active').val(),
            admin: this.$('#administrator').val()
        });
        if (!_.isEmpty(this.$('#password').val()))
            user.set({password: this.$('#password').val()});

        if (new_user) {
            user.register({
                success: function () {
                    loading.remove();
                    if (_.isUndefined(this.parent))
                        window.app.adminView.onBack();
                    else
                        this.parent.remove();

                    new MessageView({
                        title: $._("User created"),
                        message: $._("The user was created successfully")
                    }).render();
                },
                error: function (text) {
                    loading.remove();
                    //TODO: Parse error message and display errors
                    new MessageView({
                       title: $._('Error!'),
                       message: text
                    }).render();
                }
            });
        } else {
            user.update({
                success: function () {
                    loading.remove();
                    if (_.isUndefined(this.parent))
                        window.app.adminView.onBack();
                    else
                        this.parent.remove();

                    new MessageView({
                        title: $._("Update successful"),
                        message: $._("The user was updated successfully")
                    }).render();
                },
                error: function (text) {
                    loading.remove();
                    //TODO: Parse error message and display errors
                    new MessageView({
                       title: $._('Error!'),
                       message: text
                    }).render();
                }
            });
        }
    }
});

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

window.ImExportView = Backbone.View.extend({
   
    id: 'imexport',
    className: 'modal',

    events: {
       "hidden": "remove",
       "click .modal-footer a.cancel": "remove",
       "click ul.tabs a": "onTabsChange",
       "click a.import": "onImport",
       "click a.export": "onExport"
    },

    render: function() {
        $(this.el).html(templates.imexportView);

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

        $(this.el).remove();
        window.app.navigate('');   
    },

    onTabsChange: function(e) {
        this.$('ul.tabs li').each(function() {
            if ($(this).hasClass('active'))
                $(this).removeClass('active');
        });
        $(e.target).parent().addClass("active");

        this.$('#import').toggle();
        this.$('#export').toggle();

        return false;
    },

    onImport: function() {
        var that = this;

        if (_.isEmpty(this.$('#import input').val())) {
            new MessageView({title: $._('Error!'), message: $._('No file specified')}).render();
            return false;
        }

        var files = evt.target.files;
        // Assume there is only one file selected
        var file = files[0];

        var reader = new FileReader();
        reader.onloadend = (function (file, dialog) {
            return function(e) {
                if (e.target.readyState === FileReader.DONE) {
                    var data = JSON.parse(e.target.result);

                    if (!_.isEmpty(data.marks)) {
                        window.markList.reset();
                        window.markList.fromJSON(data.marks);
                    }
                    if (!_.isEmpty(data.route)) {
                        window.map.drawRoute(data.route);
                    }

                    dialog.remove();
                }
            };
        })(file, that);
        reader.onerror = function (e) {
            log(e);
        };

        reader.readAsText(file);

       return false;
    },

    onExport: function() {
        var contents = {marks: [], route: {}};
        contents.marks = window.markList.toJSON();

        var route = window.map.getRoute();
        if (typeof route === 'String')
            contents.route = JSON.parse(route);
        else if (typeof route == 'Object')
            contents.route = route;

        var dataURI = 'data:application/octet-stream;charset=utf-8;base64,' + Base64.encode(JSON.stringify(contents));
        var win = window.open(dataURI, "export.json");

        return false;
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
        $(this.el).html(templates.messageView({title: this.title, message: this.message}));

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
        $(this.el).html(templates.loadingView({message: this.message}));

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
