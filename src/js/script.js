$(function() {
    window.app = new Router();    
    Backbone.history.start();
    
    var topbar = new Topbar();
    
    window.app.user.onStartup();
});




