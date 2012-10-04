window.TopbarView = Backbone.View.extend({

    tagName: 'header',
    className: 'navbar',

    events: {
        "click a.menu": "showDropdown",
        "submit form": "onSearchSubmit"
    },

    initialize: function () {
        window.app.user.bind('login', this.onLogin, this);
    },

    render: function () {
        this.$el.html(templates.topbarView);
        $('#container').append(this.el);

        this.$('ul li.menu, ul li.user').each(function () {
            $(this).css('display', 'block').hide();
        });
        return this;
    },

    hideNavigation: function () {
        this.$('ul.private-server').hide();
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

        var s = this.$('form input[type=search]').val(),
            that = this;
        nomApi.search(s, function (success, data) {
            var spot = null;
            for (var i in data) {
                if (data[i]["class"] == "boundary")
                    continue;
                spot = data[i];
                break;
            }

            if (_.isNull(spot)) {
                new MessageView({title: $._("Error"), message: $._("Couldn't find the spot")}).render();
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
