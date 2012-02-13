window.AdminView = Backbone.View.extend({

    id: 'admin',
    className: 'modal',

    events: {
        "hidden": "remove",
        "click .cancel": "remove",
        "click .back": "onBack"
    },

    initialize: function() {
        $(window).resize(_.bind(this.resize, this));
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

        loadingView = new LoadingView($._('Loading table data')).render();

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
                    for (var i in text.users)
                        that.$('tbody').append(templates.adminTableRowView({user: text.users[i]}));

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

                    that.resize();
                    loadingView.remove();
                } else {
                    loadingView.remove();
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

        window.app.navigate('/admin/user/' + user.userid, true);
        return false;
    }
});
