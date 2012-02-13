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

        var user = window.app.user,
            that = this;
        user.set({
            firstname: this.$('#firstname').val(),
            lastname: this.$('#lastname').val(),
            address: this.$('#address').val(),
            email: this.$('#email').val(),
            password: this.$('#password').val()
        });        
        user.register({
            success: function () {
                that.loading.remove();
                that.remove();
                window.app.navigate('/login', true);

                new MessageView({
                    title: $._("Registration successful"),
                    message: $._("The registration was successful. Please wait until an administrator activates your account.")
                }).render();
            },
            error: function (text) {
                that.loading.remove();
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
