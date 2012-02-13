window.UserView = Backbone.View.extend({

    id: 'admin-user',

    events: {
        "click a.save": "onSubmitClick"
    },

    render: function () {
        var user = {}, 
            own_data = false;

        if (!_.isUndefined(this.model) && !_.isNull(this.model))
            user = this.model.toJSON();

        if (!_.isUndefined(this.options.parent) && this.model === window.app.user)
            own_data = true;

        $(this.el).html(templates.userView({user: user, own_data: own_data}));

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
        if ($(this.el).modal(true).isShown)
            $(this.el).modal('hide');
        if (_.isFunction(this.options.remove))
            this.options.remove();
        $(this.el).remove();
        window.app.navigate('');
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
            active: this.$('#active').is(':checked'),
            admin: this.$('#administrator').is(':checked')
        });
        if (!_.isEmpty(this.$('#password').val()))
            user.set({password: this.$('#password').val()});

        var that = this;
        if (new_user) {
            user.register({
                success: function () {
                    loading.remove();
                    if (_.isUndefined(that.options.parent))
                        window.app.adminView.onBack();
                    else
                        that.options.parent.remove();

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
                    if (_.isUndefined(that.options.parent))
                        window.app.adminView.onBack();
                    else
                        that.options.parent.remove();

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
