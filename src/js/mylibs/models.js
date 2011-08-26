window.User = Backbone.Model.extend({
    
    defaults: {
        login: false
    },
    
    initialize: function() {     
        var cookie = $.cookie('tourenplaner');
        if (cookie && typeof cookie !== 'undefined') {
            var dec, decarr;
            try {
                dec = Base64.decode(cookie);
                decarr = dec.split(':');
                if (decarr.length < 2)
                    cookie = null;
                else
                    cookie = this.login(decarr[0], decarr[1]) ? cookie : null;
            } catch (e) {
                cookie = null;
            }
        }
        
        //TODO: Add ssl: true if ssl is enabled on this server
        if (cookie === null)
            $.cookie('tourenplaner', cookie);
    },
    
    login: function(username, password) {
        var hash = Base64.encode(username + ':' + password);
        
        $.cookie('tourenplaner', hash, {expires: 7, path: '/'});
        this.set({login: true});
        this.trigger('login', true)
        return true;
    },
    
    logout: function() {
        $.cookie('tourenplaner', null);
        this.set({login: false});
        this.trigger('login', false);
    },
    
    isLoggedIn: function() {
        return this.get('login');
    }
    
});