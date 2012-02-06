$(function() {
    window.api = null;
    if (location.protocol === 'file:' || location.host === 'localhost' || location.host === '127.0.0.1') {
        window.api = new Api({
//            server: null
            server: "gerbera.informatik.uni-stuttgart.de",
            port: 8080
        });
    } else {
        window.api = new Api({
            server: "gerbera.informatik.uni-stuttgart.de",
            port: 8080
        });
    }

    window.server = new ServerInfo();
    window.app = new Router();
    Backbone.history.start({silent: true});

    window.map = new Map("map");

    window.markList = new MarkList();

    window.body = new BodyView();
    window.algview = window.body.main.algview;

    window.app.initServer();
});
