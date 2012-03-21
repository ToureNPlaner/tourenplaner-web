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

    render: function (id) {
        this.admin = window.app.user.get("admin");
        this.showAll = false;
        this.id = id;

        var content = templates.billingMainView;
        this.content = this.loadingView = null;
        
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

        var all = false;
        if(this.showAll && this.admin) all = true;
        
        if (!_.isNull(this.loadingView))
            this.loadingView.remove();
        this.loadingView = new LoadingView($._("Loading billing data")).render();

        var that = this;
        api.listRequests({
            limit: this.position.limit,
            offset: this.position.offset,
            id: this.id,
            all: all,
            callback: function (text, success) {
                if (success && _.isNull(that.content)) {
                    var page = Math.floor((that.position.offset / that.position.limit) + 1);
                    var pages = Math.ceil(text.number / that.position.limit);

                    // Update table
                    that.$('tbody').html('');
                    for (var i in text.requests){
                        var date;
                        if(!_.isNull(text.requests[i].requestdate)){
                            date = text.requests[i].requestdate.substr(0,10);
                            date += " ";
                            date += text.requests[i].requestdate.substr(11,8);
                            text.requests[i].requestdate = date;
                        }
                        if(!_.isNull(text.requests[i].finisheddate)){
                            date = text.requests[i].finisheddate.substr(0,10);
                            date += " ";
                            date += text.requests[i].finisheddate.substr(11,8);
                            text.requests[i].finisheddate = date;
                        }
                        that.$('tbody').append(templates.billingTableRowView({request: text.requests[i]}));
                        // add click handling (draw clicked route) TODO: Actually support this
                        that.$('#billing-item').each(function () {
                            $(this).click(function(){
                                var link = '/route/' + $(this).children()[0].innerHTML;
                                that.remove();
                                window.app.navigate(link, {trigger: true});
                            });
                        });						
                    }

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

        window.app.navigate('billing');
        return false;
    }
});
