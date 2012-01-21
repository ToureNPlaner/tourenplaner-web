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
