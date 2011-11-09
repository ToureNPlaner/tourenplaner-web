$(function() {
   window.api = new Api({
        server: "gerbera.informatik.uni-stuttgart.de",
        port: 8080
    });
    /*window.api = new Api({
        server: null
    });*/
    window.app = new Router();
    Backbone.history.start();

    window.mapModel = new MapModel();
    window.markList = new MarkList();
    
    window.body = new BodyView();

    window.app.initServer();
    window.app.user.onStartup();
});
