$(function() {
    window.api = new Api({
        server: null
    });

    window.server = new ServerInfo();
    window.app = new Router();
    Backbone.history.start({silent: true});

    window.map = new Map("map");

    window.markList = new MarkList();

    window.body = new BodyView();
    window.algview = window.body.main.algview;

    window.app.initServer();
});
