$(function() {
    window.app = new Router();
    Backbone.history.start();

    window.body = new BodyView();

    window.app.user.onStartup();
});
