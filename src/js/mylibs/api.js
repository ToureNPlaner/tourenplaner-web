(function() {

window.Api = function(attributes) {
    var defaults;

    attributes || (attributes = {});
    if (defaults = this.defaults)
        attributes = _.extend({}, defaults, attributes);

    this.attributes = {};
    this.set(attributes);
};

_.extend(window.Api.prototype, {
    defaults: {
        authAsBase64 : '', // provides username+password Base64 encoded
        authRequired : false,
        server : 'localhost', // url of the server
        port : '8081', // port on which the server listens
        ssl: false
    },

    set: function(attrs) {
        if (!attrs)
            return this;

        for (var attr in attrs)
            this.attributes[attr] = attrs[attr];

        return this;
    },

    get: function(attr) {
        return this.attributes[attr];
    },

    /* send
     * sends given request to server. with or without authentication.
     * handles callback from reqData
     * param: reqData
     *          .type chooses how the request should be send. POST or GET.
     *          .suffix chooses algorithm, info or modi.
     *          .request String that contains the request.
     *          .callback function should be called when done.
     */
    send : function (reqData) {
        var url = "", event = {};
        if (!_.isNull(this.get('server')) && !_.isUndefined('server')) {
            url +=  this.get('ssl') ? 'https://' : 'http://' +
                    this.get('server') + ':' +
                    (!_.isNaN(this.get('port')) ? this.get('port') : 80);
        }
        url += '/' + reqData.suffix;

        // init event for events and bind callback to it
        _.extend(event, Backbone.Events);
        if (_.isFunction(reqData.callback))
            event.bind('request', reqData.callback);

        // method performs an asyncronous HTTP request with or without
        // authentication.
        // performs a callback, successful or not
        var that = this;
        $.ajax({
            url: url,
            cache: false,
            type: reqData.type,
            accepts: 'json',
            data: reqData.request,
            beforeSend: function (jqXHR, settings) {
                if (that.get('authRequired')) {
                    settings.headers = { Authorization: that.get('authAsBase64') };
                }
            },
            success: function (data, textStatus, jqXHR) {
                event.trigger('request', jqXHR.responseText, true);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                event.trigger('request', errorThrown, false);
            }
        });
    },

    /* serverInformation
     * aks' server for information about the server
     */
    serverInformation : function (args) {
        this.send({
            type : 'GET',
            suffix : 'info',
            request : '',
            callback: _.isFunction(args.callback) ? args.callback : null
        });
    },

    /* registerUser
     * creates new user account
     */
    registerUser: function (args) {
        this.send({
            type : 'POST',
            suffix : 'registeruser',
            request : args.userObject,
            callback: _.isFunction(args.callback) ? args.callback : null
        });
    },

    /* authUser
     * confirmes user.
     */
    authUser : function (args) {
        if (!args || !args.email || !args.password)
            return false;

        this.set({'authAsBase64': Base64.encode(args.email + ':' + args.password)});

        return this.send({ //return???
            type: 'GET',
            suffix: 'authuser',
            callback: _.isFunction(args.callback) ? args.callback : null
        });
    },

    /* getUser
     * get user data by id or own data.
     * param: id of requested user, null for own data
     */
    getUser : function (args) {
        if (_.isNaN(args.id)) {
            this.send({
                type : 'GET',
                suffix : 'getuser',
                request : '',
                callback : _.isFunction(args.callback) ? args.callback : null
            });
        } else {
            this.send({
                type : 'GET',
                suffix : 'getuser?ID=' + id,
                request : '',
                callback : _.isFunction(args.callback) ? args.callback : null
            });
        }
    },

    /* updateUser
     * change user data by id or own
     * param: id of user you want to change, null if to change own
     */
    updateUser : function (args) {
        if (_.isNaN(args.id)) {
            this.send({
                type : 'POST',
                suffix : 'updateuser',
                request : args.userObject,
                callback : _.isFunction(args.callback) ? args.callback : null
            });
        } else {
            this.send({
                type : 'POST',
                suffix : 'updateuser?ID=' + args.id,
                request : args.userObject,
                callback : _.isFunction(args.callback) ? args.callback : null
            });
        }
    },

    /* listRequests
     * lists all requests that have been made
     * param: id of single user, null if general request
     * param: limit max number of items
     * param: offset of first item
     */
    listRequest : function (args) {
        if (_.isNaN(args.id)) {
            return this.send({
                type : 'POST',
                suffix : 'listrequests?Limit=' + args.limit + '&Offset=' + args.offset,
                request : '',
                callback : _.isFunction(args.callback) ? args.callback : null
            });
        } else {
            return this.send({
                type : 'POST',
                suffix : 'listrequests?ID=' + args.id +
                         '&Limit=' + args.limit + '&Offset=' + args.offset,
                request : '',
                callback : _.isFunction(args.callback) ? args.callback : null
            });
        }
    },

    /* listUsers
     * lists user from server
     * param: limit max numbers of users
     * param: offset of first user
     */
    listUser : function (args) {
        this.send({
            type : 'GET',
            suffix : 'listusers?Limit=' + args.limit + '&Offset=' + args.offset,
            request : '',
            callback : _.isFunction(args.callback) ? args.callback : null
        });
    },

    /* deleteUser
     * deletes user from server
     * param: id of user that should be deleted
     */
    deleteUser : function (args) {
        this.send({
            type : 'GET',
            suffix : 'deleteuser?ID=' + args.id,
            request : '',
            callback : _.isFunction(args.callback) ? args.callback : null
        });
    },

    /* alg
     * sends algorithm calculation request
     * param: alg shortname of desired alg
     * param: request contains problem instance (format as alg specification)
     */
    alg : function (args) {
        this.send({
            type : 'POST',
            suffix : 'alg$' + args.alg,
            request : args.request,
            callback : _.isFunction(args.callback) ? args.callback : null
        });
    }
});

}).call(this);
