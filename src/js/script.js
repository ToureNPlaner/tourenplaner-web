$(function() {
    window.app = new Router();
    Backbone.history.start();

    window.body = new Body();

    window.app.user.onStartup();
});
