window.Api = function(attributes) {
    var defaults;

    attributes = attributes || {};
    if ((defaults = this.defaults))
        attributes = _.extend({}, defaults, attributes);

    this.attributes = {};
    this.set(attributes);
};

_.extend(window.Api.prototype, {
    defaults: {
        authAsBase64 : '', // provides username+password Base64 encoded
        authRequired : false,
        server : 'localhost', // url of the server
        port : 8081, // port on which the server listens
        ssl : false,
        realm : 'Tourenplaner',
        error : {"errorid": "EBADCALL",
                 "message": $._("Bad request"),
                 "details": $._("Request wasn't successful")
               }
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
     * sends given request to server. with or without authentfication.
     * handles callback from reqData
     * param: reqData
     *          .type chooses how the request should be send. POST or GET.
     *          .suffix chooses algorithm, info or modi.
     *          .request String that contains the request.
     *          .callback function should be called when done.
     */
    send : function (reqData) {
        var url = "", event = {};
        if (_.isUndefined(reqData) || _.isNull(reqData)) return false;
        if (_.isUndefined(reqData.suffix) || !reqData.suffix) return false;
        if (_.isNull(reqData.process) || _.isUndefined(reqData.process)) reqData.process = true;
        reqData.type = reqData.type || 'GET';
        reqData.request = reqData.request || {};

        if (!_.isNull(this.get('server')) && !_.isUndefined(this.get('server'))) {
            url +=  (this.get('ssl') ? 'https://' : 'http://') +
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
        var headers = this.get('authRequired') ? { Authorization: this.get('realm') + ' ' + this.get('authAsBase64')} : {};
        var that = this;
        $.ajax(url, {
            cache: false,
            type: reqData.type,
            accepts: 'json',
            dataType: 'json',
            contentType: 'application/json; charset="utf-8"',
            crossDomain: true,
            data: reqData.type == 'POST' ? JSON.stringify(reqData.request) : reqData.request,
            processData: reqData.process,
            headers: headers,
            success: function (data, textStatus, jqXHR) {
                var obj = jqXHR.responseText;
                if (_.isString(obj))
                    obj = JSON.parse(obj);
                event.trigger('request', obj, true);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                var text = jqXHR.responseText || "";

                // use simple error if response is empty
                if (text === "") {
                    if(errorThrown !== "")
                        text = errorThrown;
                    else
                        text = that.get('error').message + "<br />" + that.get('error').details; // if everything is empty use standard error
                } else {
                    text = JSON.parse(text);
                }

                event.trigger('request', text, false);

                // Also display an error message for the user
                if (!reqData.silent && (_.isUndefined(window.QUnit) && MessageView)) {
                    var message = text;
                    if (!_.isString(text))
                        message = text.message + ': ' + text.details;
                    new MessageView({title: $._("Error"), message: message}).render();
                }
            }
        });

        return true;
    },

    /* serverInformation
     * aks' server for information about the server
     */
    serverInformation : function (args) {
        var that = this;
        return this.send({
            suffix : 'info',
            request : {},
            callback: function (text, success) {
                if(text.servertype == "private")
                    that.set({'ssl': true, 'port': text.sslport, 'authRequired': true});
                if (_.isFunction(args.callback))
                    args.callback(text, success);
            }
        });
    },

    /* registerUser
     * creates new user account
     * param: userObject containing info about user
     */
    registerUser: function (args) {
        if (!args || !args.userObject)
            return false;
        this.send({
            type : 'POST',
            suffix : 'registeruser',
            request : args.userObject,
            callback: _.isFunction(args.callback) ? args.callback : null
        });

        return true;
    },

    /* authUser
     * confirmes user.
     * param: email email-adress of user
     * param: password that belongs to email
     */
    authUser : function (args) {
        if (!args || !args.email || !args.password)
            return false;
        
        this.set({'authAsBase64': Base64.encode(args.email + ':' + args.password)});

        this.send({
            silent: true,
            suffix: 'authuser',
            callback: _.isFunction(args.callback) ? args.callback : null
        });

        return true;
    },

    /* getUser
     * get user data by id or own data.
     * param: id of requested user, null for own data
     */
    getUser : function (args) {
        var suffix = 'getuser';
        if (args.id && !_.isNaN(args.id))
            suffix += '?ID=' + args.id;

        this.send({
            suffix : suffix,
            request : '',
            callback : _.isFunction(args.callback) ? args.callback : null
        });
        return true;
    },

    /* updateUser
     * change user data by id or own
     * param: id of user you want to change, null if to change own
     */
    updateUser : function (args) {
        if (!args || !args.userObject)
            return false;

        var suffix = 'updateuser';
        if (args.id && !_.isNaN(args.id))
            suffix += '?ID=' + args.id;

        this.send({
            type : 'POST',
            suffix : suffix,
            request : args.userObject,
            callback : _.isFunction(args.callback) ? args.callback : null
        });

        return true;
    },

    /* listRequests
     * lists all requests that have been made
     * param: id of single user, null if general request
     * param: limit max number of items
     * param: offset of first item
     */
    listRequests : function (args) {
        if (!args || !args.limit || !args.offset ||
            args.offset<0 || args.limit<0 || isNaN(args.offset) || isNaN(args.limit))
            return false;
            
        var suffix = 'listrequests?Limit=' + args.limit + '&Offset=' + args.offset;
        if (args.id && !isNaN(args.id))
            suffix += '&ID=' + args.id;

        this.send({
            type : 'POST',
            suffix : suffix,
            request : '',
            callback : _.isFunction(args.callback) ? args.callback : null
        });

        return true;
    },

    /* listUsers
     * lists user from server
     * param: limit max numbers of users
     * param: offset of first user
     */
    listUsers : function (args) {
        if (!args || _.isUndefined(args.limit) || _.isUndefined(args.offset) ||
            isNaN(args.offset) || isNaN(args.limit) || args.offset<0 || args.limit<0)
            return false;
        this.send({
            suffix : 'listusers?Limit=' + args.limit + '&Offset=' + args.offset,
            request : '',
            callback : _.isFunction(args.callback) ? args.callback : null
        });

        return true;
    },

    /* deleteUser
     * deletes user from server
     * param: id of user that should be deleted
     */
    deleteUser : function (args) {
        if (!args || !args.id || isNaN(args.id))
            return false;
        this.send({
            suffix : 'deleteuser?ID=' + args.id,
            request : '',
            callback : _.isFunction(args.callback) ? args.callback : null
        });

        return true;
    },

    /* nearestNeighbour
     * sends request for nearest neighbour to server
     * param: points list of points
     */
    nearestNeighbour : function (args) {
        if (!args || !args.points)
            return false;
        this.send({
            suffix : 'algnns',
            type : 'POST',
            request : {
                version: 1,
                points: _.isArray(args.points) ? args.points : [args.points]
            },
            callback : _.isFunction(args.callback) ? args.callback : null
        });

        return true;
    },

    /* alg
     * sends algorithm calculation request
     * use params request or one for each request element
     * param: alg shortname of desired alg
     * param: request contains problem instance (format as alg specification)
     * param: points, version, constraints as alg spec
     */
    alg : function (args) {
        var thisrequest = {};
        if (!args || !args.alg)
            return false;
        // use given request or make own
        if (args.request) {
            if(!args.request.points)
                return false;
            else
                thisrequest = args.request;

        } else {
            if(!args.points)
                return false;
            thisrequest = {
                version: args.version || 1,
                points: args.points,
                constraints: args.constraints || {}
            };
        }
        this.send({
            type : 'POST',
            suffix : 'alg' + args.alg,
            request : thisrequest,
            process: false,
            callback : _.isFunction(args.callback) ? args.callback : null
        });

        return true;
    },

    getRequest: function(args) {
        if (!args || !args.id)
            return false;
        
        this.send({
            suffix: 'getrequest?id=' + args.id,
            request: '',
            callback: _.isFunction(args.callback) ? args.callback : null
        });

        return true;
    }
});
