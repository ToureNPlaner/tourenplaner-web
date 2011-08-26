window.Topbar = Backbone.View.extend({
    
    el: $('header'),
    
    initialize: function() {
        this.$('a.menu').click(this.dropdown);
        window.app.user.bind('login', this.userStatus, this);
    },

    dropdown: function() {
        $(this).parent().toggleClass('open');
        return false;
    },
    
    userStatus: function(login) {
        var user = window.app.user;
        this.$('ul li').toggle();
        
        if (user.isLoggedIn())
            this.$('li.user').html(user.get('vorname') + ' ' + user.get('nachname'));
    }
    
});