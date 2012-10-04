window.AdminView = Backbone.View.extend({

    id: 'admin',
    className: 'modal',

    events: {
        "hidden": "remove",
        "click .cancel": "remove",
        "click .close": "remove",
        "click .back": "onBack"
    },

    initialize: function() {
        $(window).resize(_.bind(this.resize, this));
    },

    render: function () {
        var content = templates.adminMainView;
        this.content = this.loadingView = null;

        this.$el.html(templates.adminView({content: content}));
        this.$el.modal({
            show: true,
            keyboard: true,
            backdrop: 'static'
        });

        this.renderMainView();

        return this;
    },

    renderMainView: function () {
        // calculate row count
        var lineHeight = 37;
        var modalTableHeight = $(document).height() - 350;
        var height = $(document).height() + 'px';
        var limit = modalTableHeight / lineHeight;
        limit = Math.floor(limit);
        if(limit<2) limit=2;

        if (_.isUndefined(this.position)) {
            this.position = {
                limit: limit,
                offset: 0
            };
        }

        if (!_.isNull(this.loadingView))
            this.loadingView.remove();
        this.loadingView = new LoadingView($._('Loading table data')).render();

        var that = this;
        api.listUsers({
            limit: this.position.limit,
            offset: this.position.offset,
            callback: function (text, success) {
                if (success && _.isNull(that.content)) {
                    var page = Math.floor((that.position.offset / that.position.limit) + 1);
                    var pages = Math.ceil(text.number / that.position.limit);

                    // Update table
                    that.$('tbody').html('');
                    for (var i in text.users){
                        if(text.users[i].status === "verified")
                            text.users[i].active = true;
                        else
                            text.users[i].active = false;
                        that.$('tbody').append(templates.adminTableRowView({user: text.users[i]}));
                    }

                    that.$('tbody a.activate').each(function () {
                        var i = $(this).parents('tr').index();
                        $(this).click(_.bind(that.onActivateClick, that, text.users[i]));
                    });
                    that.$('tbody a.delete').each(function () {
                        var i = $(this).parents('tr').index();
                        $(this).click(_.bind(that.onDeleteClick, that, text.users[i]));
                    });
                    that.$('tbody a.edit').each(function () {
                        var i = $(this).parents('tr').index();
                        $(this).click(_.bind(that.onEditClick, that, text.users[i]));
                    });
                    that.$('tbody a.view').each(function () {
                        var i = $(this).parents('tr').index();
                        $(this).click(_.bind(that.onViewClick, that, text.users[i]));
                    });

                    // Update pagination
                    that.$('.pagination').remove();
                    that.$('.modal-body').css('overflow-x', 'hidden');
                    that.$('.modal-body').append(templates.paginationView());

                    $("#slider").slider({
                        min: 1,
                        max: pages,
                        value: page,
                        create: function(event, ui) {
                            $("#slider-val").val(page);
                            $("#slider-max").html("/" + pages);
                        },
                        stop: function(event, ui) {
                            var value = $("#slider").slider("option", "value");
                            that.onPage(value);
                        },
                        slide: function(event, ui) {
                            $("#slider-val").val(ui.value);
                        }
                    });

                    $("#slider-val").change(function() {
                        var value = $("#slider-val").val();
                        if(!_.isNaN(value) && value <= pages && value > 0)
                            that.onPage(value);
                    });

                    if (page !== 1) {
                        that.$('#slider-back').first().removeClass('disabled');
                        that.$('#slider-back').first().click(_.bind(that.onPrev, that));
                    }
                    if (page !== pages) {
                        that.$('#slider-next').first().removeClass('disabled');
                        that.$('#slider-next').first().click(_.bind(that.onNext, that));
                    }

                    that.resize();
                    that.loadingView.remove();
                    that.loadingView = null;
                } else {
                    that.loadingView.remove();
                    that.loadingView = null;
                    that.remove();
                }
            }
        });
    },

    resize: function () {
        // center modal vertical; make scrollable
        $('#admin .modal-body').css("max-height", $(document).height()-150);
        if($(document).height() < $('#admin').height())
            $('#admin .modal-body').css("overflow-y", "scroll");
        else
            $('#admin .modal-body').css("overflow-y", "auto");
        
        var top = ($(document).height() - $('#admin').height())/2;
        $('#admin').css("margin", "0 0 0 -400px");
        $('#admin').css("top", top+"px");
    },

    remove: function () {
        this.$el.modal('hide');
        if (_.isFunction(this.options.remove))
            this.options.remove();
        this.$el.remove();
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

        window.app.navigate('admin');
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

    onNext: function (pages) {
        if(this.position.offset >= (pages-1)*this.position.limit)
            return false;
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
        user.status = "verified";

        var that = this;
        api.updateUser({
            id: user.userid,
            self: false,
            userObject: user,
            callback: function (text, success) {
                that.renderMainView();
            }
        });
        return false;
    },

    onDeleteClick: function (user) {
        if (confirm($._('Do you really want to delete the user: '+user.email))) {
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

        window.app.navigate('admin/user/' + user.userid, {trigger: true});
        return false;
    },

    onViewClick: function (user) {
        this.remove();

        window.app.navigate('billing/user/' + user.userid, {trigger: true});
        return false;
    }
});
