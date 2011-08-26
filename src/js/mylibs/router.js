window.Router = Backbone.Router.extend({
   
    routes: {
        "/login":        "login",    // #login
        "/register":     "register", // #register
        "/billing":      "billing",  // #billing
        "/route/:id":    "request"   // #route/7
    },
    
    initialize: function(options) {
        log('Router initialized');
        var cookie = $.cookie('tourenplaner');
        log('Cookie', cookie);
        if (cookie && typeof cookie !== 'undefined') {
            var cookieval, arr, username;
            try {
                cookieval = Base64.decode(cookie);
            
                log('Cookie found with value:', cookie, 'decoded:', cookieval);
            
                arr = cookieval.split(':');
                if (arr.length != 2)
                    cookie = '';
                username = arr[0];
                password = arr[1];
                
                //TODO: Create User object
                //TODO: Check with the server
            } catch (e) {
                log('Invalid cookie! Resetting!');
                cookie = '';
            }
        }
        $.cookie('tourenplaner', cookie, { path: '/', expires: 7});
    },
  
    login: function() {
        _this = this;
        
        $('#login').dialog({
            modal: true,
            resizable: false,
            buttons: {
                "Login" : function() {
                    alert('To be implemented');
                    $(this).dialog('close');
                },
                "Cancel" : function() {
                    $(this).dialog('close');
                }
            },
            close: function() {
                $('input', this).val('').removeClass('ui-state-error');
                $('.validate', this).hide();
                _this.navigate('');
            }        
        });
    },
    
    register: function() {
        alert('To be implemented');
    },
    
    billing: function() {
        alert('To be implemented');
    },
    
    request: function(id) {
        alert('To be implemented');
    }
    
});