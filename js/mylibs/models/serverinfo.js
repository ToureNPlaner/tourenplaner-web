window.ServerInfo = Backbone.Model.extend({
    defaults: {
        loaded: false,
        version: null,
        servertype: 'public',
        port: 80,
        ssl: false,
        algorithms: []
    },

    initialize: function () {

    },

    getServerInfo: function (callback) {
        var that = this;
        window.api.serverInformation({
            callback: function (text, success) {
                if (!success)
                    return;
                var obj = text;
                if (_.isString(obj))
                    obj = JSON.parse(obj);

                if (!_.isNaN(obj.sslport) && !_.isUndefined(obj.sslport)) {
                    that.set({
                        'ssl': true,
                        'port': obj.sslport
                    });
                }
                that.set({
                    loaded: true,
                    servertype: obj.servertype,
                    version: obj.version,
                    algorithms: obj.algorithms
                });

                that.trigger("info-loaded");
                if (_.isFunction(callback))
                    callback();
            }
        });
    },

    isPublic: function () {
        return this.get('servertype') == "public";
    },

    isLoaded: function () {
        return this.get('loaded');
    }
});
