$(function() {
    window.api = new Api({
        server: "gerbera.informatik.uni-stuttgart.de",
        port: 8080
    });
    /*window.api = new Api({
        server: null
    });*/

    // moved to this file from router.js
    window.server = new ServerInfo();

    window.app = new Router();
    Backbone.history.start({silent: true});

    window.mapModel = new MapModel();
    window.markList = new MarkList();

    window.body = new BodyView();

    window.app.initServer();
});
