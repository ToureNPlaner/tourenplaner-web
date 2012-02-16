window.BillingView = Backbone.View.extend({
    id: 'billing',
    className: 'modal',

    events: {
        "hidden": "remove",
        "click .modal-footer a.cancel": "remove",
        "click #billingShowAll": "toggleShowAll"
    },

    initialize: function() {
        $(window).resize(_.bind(this.resize, this));
    },

    render: function () {
        this.admin = window.app.user.get("admin");
        this.showAll = false;

        var content = templates.billingMainView;
        this.content = null;
        
        this.$el.html(templates.billingView({content: content, admin: this.admin, showAll: this.showAll ? "checked" : null}));
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
        var id = window.app.user.get("userid");
        if(this.showAll && this.admin) id = null;
        
        loadingView = new LoadingView($._("Loading billing data")).render();

        var that = this;
        api.listRequests({
            limit: this.position.limit,
            offset: this.position.offset,
            id: id,
            callback: function (text, success) {
                if (success && _.isNull(that.content)) {
                    var page = Math.floor((that.position.offset / that.position.limit) + 1);
                    var pages = Math.ceil(text.number / that.position.limit);

                    // Update table
                    that.$('tbody').html('');
                    for (var i in text.requests){
                    	text.requests[i].request = JSON.stringify(text.requests[i].request);
                    	text.requests[i].response = JSON.stringify(text.requests[i].response);
                        that.$('tbody').append(templates.billingTableRowView({request: text.requests[i]}));
                        // add click handling (draw clicked route) TODO: Actually support this
                        that.$('#billing-item').each(function () {
                            $(this).click(function(){
                                var link = '/route/' + $(this).children()[0].innerHTML;
                                that.remove();
                                window.app.navigate(link, true);
                            });
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
                    // ugly but it works
                    $('#billing').css({width: $('#billing.modal div.modal-body table thead').outerWidth() + 20 + 'px'});

                    if (page !== 1)
                        that.$('.pagination li').first().removeClass('disabled');
                    if (page !== pages)
                        that.$('.pagination li').last().removeClass('disabled');

                    // Add events
                    that.$('.pagination li a').first().click(_.bind(that.onPrev, that));
                    that.$('.pagination li a').last().click(_.bind(that.onNext, that, pages));
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

    toggleShowAll: function() {
        if($(':checkbox').is(':checked'))
            this.showAll = true;
        else
            this.showAll = false;
        
        this.renderMainView();
    },

    resize: function () {
        // center modal vertical; make scrollable
        $('#billing .modal-body').css("max-height", $(document).height()-150);
        if($(document).height() < $('#billing').height())
            $('#billing .modal-body').css("overflow-y", "scroll");
        else
            $('#billing .modal-body').css("overflow-y", "auto");
        
        var top = ($(document).height() - $('#billing').height())/2;
        $('#billing').css("margin", "0 0 0 -400px");
        $('#billing').css("top", top+"px");
    },

    remove: function () {
        if (this.$el.modal(true).isShown)
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
