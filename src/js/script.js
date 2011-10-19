$(function() {
    window.api = new Api({
        server: null,    // Only to enable the mock api
        authRequired: true
    });

    window.app = new Router();
    Backbone.history.start();

    window.body = new BodyView();

    window.app.initServer();
    window.app.user.onStartup();
});
