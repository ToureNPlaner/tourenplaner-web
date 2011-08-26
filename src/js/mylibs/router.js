window.Router = Backbone.Router.extend({
   
    routes: {
        "/login":        "login",    // #/login
        "/logout":       "logout",   // #/logout
        "/register":     "register", // #/register
        "/settings":     "settings", // #/settings
        "/billing":      "billing",  // #/billing
        "/route/:id":    "request"   // #/route/7
    },
    
    initialize: function(options) {
        this.user = new User();
    },
  
    login: function() {
        _this = this;
        
        $('#login').dialog({
            modal: true,
            resizable: false,
            buttons: {
                "Login" : function() {
                    var username = $('#email', this).val();
                    var password = $('#password', this).val();
                    if (!window.app.user.login(username, password))
                        $('.validate', this).show();
                    else
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
    
    logout: function() {
        if (this.user.isLoggedIn())
            this.user.logout();
    },
    
    register: function() {
        alert('To be implemented');
    },
    
    settings: function() {
        alert('To be implemented');
    },
    
    billing: function() {
        alert('To be implemented');
    },
    
    request: function(id) {
        alert('To be implemented');
    }
    
});