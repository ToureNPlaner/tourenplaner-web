window.User = Backbone.Model.extend({
    
    defaults: {
        login: false
    },
    
    /** Don't use initialize here because it gets called too early */
    onStartup: function() {     
        var cookie = $.cookie('tourenplaner');
        if (cookie && typeof cookie !== 'undefined') {
            var dec, decarr;
            try {
                dec = Base64.decode(cookie);
                decarr = dec.split(':');
                log(dec, decarr);
                if (decarr.length == 2 && this.login(decarr[0], decarr[1]))
                    return;
            } catch (e) {
                log('Invalid cookie', cookie);
            }
            cookie = null;
        }
        
        //TODO: Add ssl: true if ssl is enabled on this server
        $.cookie('tourenplaner', cookie);
    },
    
    login: function(username, password) {
        var hash = Base64.encode(username + ':' + password);
        
        if (username !== 'asd' && password !== 'asd')
            return false;
        
        log('Login successful');
        
        $.cookie('tourenplaner', hash, {expires: 7, path: '/'});
        this.set({login: true, firstname: 'Peter', lastname: 'Lustig', email: username, password: password});
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