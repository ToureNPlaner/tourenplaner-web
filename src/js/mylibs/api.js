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
        server : 'http://localhost', // url of the server
        port : '8081' // port on which the server listens
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
        if (!_.isNull(this.get('server')) && !_.isUndefined('server'))
            url += this.get('server') + ':' + (!_.isNaN(this.get('port')) ? this.get('port') : 80);
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
    serverInformation : function () {
        var callbackHandler, reqData;
        callbackHandler = function (response, successful) {
            if (successful) {
                // do something with your answer
            } else {
                // handle error
            }
        };
        reqData = {
            type : 'GET',
            suffix : 'info',
            request : '',
            callback : callbackHandler
        };
        this.send(reqData);
    },

    /* registerUser
     * creates new user account
     */
    registerUser: function (userObject) {
        return this.send('POST', 'registeruser', userObject);
    },

    /* authUser
     * confirmes user.
     */
    authUser : function (args) {
        if (!args || !args.email || !args.password)
            return false;

        this.set({'authAsBase64': Base64.encode(args.email + ':' + args.password)});

        return this.send({
            type: 'GET',
            suffix: 'authuser',
            callback: _.isFunction(args.callback) ? args.callback : null
        });
    },

    /* getUser
     * get user data by id or own data.
     * param: id of requested user, null for own data
     */
    getUser : function (id) {
        if (_.isNaN(id)) {
            return this.send('GET', 'getuser', '');
        } else {
            return this.send('GET', 'getuser?ID=' + id, '');
        }
    },

    /* updateUser
     * change user data by id or own
     * param: id of user you want to change, null if to change own
     */
    updateUser : function (id, userObject) {
        if (_.isNaN(id)) {
            return this.send('POST', 'updateuser', userObject);
        } else {
            return this.send('POST', 'updateuser?ID=' + id, userObject);
        }
    },

    /* listRequests
     * lists all requests that have been made
     * param: id of single user, null if general request
     * param: limit max number of items
     * param: offset of first item
     */
    listRequest : function (id, limit, offset) {
        if (_.isNaN(id)) {
            return this.send('POST',
                             'listrequests?Limit=' + limit +
                             '&Offset=' + offset, '');
        } else {
            return this.send('POST',
                             'listrequests?ID=' + id +
                             '&Limit=' + limit +
                             '&Offset=' + offset, '');
        }
    },

    /* listUsers
     * lists user from server
     * param: limit max numbers of users
     * param: offset of first user
     */
    listUser : function (limit, offset) {
        return this.send('GET',
                         'listusers?Limit=' + limit +
                         '&Offset=' + offset, '');
    },

    /* deleteUser
     * deletes user from server
     * param: id of user that should be deleted
     */
    deleteUser : function (id) {
        return this.send('GET',
                         'deleteuser?ID=' + id,
                         '');
    },

    /* alg
     * sends algorithm calculation request
     * param: alg shortname of desired alg
     * param: request contains problem instance (format as alg specification)
     */
    alg : function (alg, request) {
        return this.send('POST', 'alg$' + alg, request);
    }
});

}).call(this);
