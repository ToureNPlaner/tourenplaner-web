/**
 * The Api class provides a simple interface to all functions the ToureNPlaner server provides.
 */
window.Api = function(attributes) {
    var defaults;

    attributes = attributes || {};
    if ((defaults = this.defaults))
        attributes = _.extend({}, defaults, attributes);

    this.attributes = {};
    this.set(attributes);
};

_.extend(window.Api.prototype, {
    /* The default configuration */
    defaults: {
        authAsBase64 : '', // provides username+password Base64 encoded
        authRequired : false,
        server : 'localhost', // url of the server
        port : 8081, // port on which the server listens
        ssl : false,
        realm : 'Tourenplaner'
    },

    /**
     * Change one or multiple configuration variables.
     *
     * @param attrs Key-Value object of configuration variables
     * @return The instance of the class
     */
    set: function(attrs) {
        if (!attrs)
            return this;

        for (var attr in attrs)
            this.attributes[attr] = attrs[attr];

        return this;
    },

    /**
     * Get a configuration variable by name.
     *
     * @param attr The name of the configuration variable
     * @return The value of the variable
     */
    get: function(attr) {
        return this.attributes[attr];
    },

    /**
     * Sends the given request to the server. May include an Authorization header if necessary.
     * 
     * @param reqData.type The HTTP request type, e.g. POST or GET
     * @param reqData.suffix The suffix used for the requested API method
     * @param reqData.request String/Object containing the request
     * @param reqData.callback Callback function that gets called once the request returns
     * @return False if the reqData object was incorrect
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
        var headers = this.get('authRequired') && !_.isEmpty(this.get('authAsBase64')) ? { Authorization: this.get('realm') + ' ' + this.get('authAsBase64')} : {};
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
                if (_.isString(obj) && obj != '')
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
                        text = that.get('error').message + ": " + that.get('error').details; // if everything is empty use standard error
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

    /**
     * Retrieve the server information object from the server. Automatically sets some configuration variables for the api.
     *
     * @param args.callback Callback function that gets called after the request returns
     * @param args.callback Callback function which will be called after the request returns
     * @return True if the arguments were correct, false otherwise
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

    /**
     * Creates a new user account on the server.
     * 
     * @param args.userObject Object containing the necessary infos to create a user
     * @param args.callback Callback function which will be called after the request returns
     * @return True if the arguments were correct, false otherwise
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

    /**
     * Checks the email/password combination with the server.
     *
     * @param args.email Emailaddress of the user
     * @param args.password Password of the user
     * @param args.callback Callback function which will be called after the request returns
     * @return True if the arguments were correct, false otherwise
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

    /**
     * Remove all login informations.
     */
    logout : function () {
        this.set({'authAsBase64': ''});
    },

    /**
     * Get user data of the given id or the own data.
     *
     * @param args.id The id of the user for which to get the data (optional)
     * @param args.callback Callback function which will be called after the request returns
     * @return True if the arguments were correct, false otherwise
     */
    getUser : function (args) {
        var suffix = 'getuser';
        if (args.id && !_.isNaN(args.id))
            suffix += '?id=' + args.id;

        this.send({
            suffix : suffix,
            request : '',
            callback : _.isFunction(args.callback) ? args.callback : null
        });
        return true;
    },

    /**
     * Change the user data of the given id or the data of the logged in user.
     *
     * @param args.id The id of the user for which to change the data (optional)
     * @param args.userObject The new user data
     * @param args.callback Callback function which will be called after the request returns
     * @return True if the arguments were correct, false otherwise
     */
    updateUser : function (args) {
        if (!args || !args.userObject)
            return false;

        var suffix = 'updateuser';
        if (args.id && !_.isNaN(args.id))
            suffix += '?id=' + args.id;

        this.send({
            type : 'POST',
            suffix : suffix,
            request : args.userObject,
            callback : _.isFunction(args.callback) ? args.callback : null
        });

        return true;
    },

    /**
     * Retrieves a list of all requests of every user or of a single, specified user.
     *
     * @param args.id The id of the single user (optional)
     * qparam args.limit The max. number of items retrieved
     * @param args.offset The offset of the first retrieved item
     * @param args.callback Callback function which will be called after the request returns
     * @return True if the arguments were correct, false otherwise
     */
    listRequests : function (args) {
        if (!args || args.offset<0 || args.limit<0 || isNaN(args.offset) || isNaN(args.limit))
            return false;
            
        var suffix = 'listrequests?limit=' + args.limit + '&offset=' + args.offset;
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

    /**
     * Retrieves a list of all registered users on the server.
     *
     * @param args.limit The max. numbers of users retrieved
     * @param args.offset The offset of the first retrieved user
     * @param args.callback Callback function which will be called after the request returns
     * @return True if the arguments were correct, false otherwise
     */
    listUsers : function (args) {
        if (!args || isNaN(args.offset) || isNaN(args.limit) || args.offset<0 || args.limit<0)
            return false;
        this.send({
            suffix : 'listusers?limit=' + args.limit + '&offset=' + args.offset,
            request : '',
            callback : _.isFunction(args.callback) ? args.callback : null
        });

        return true;
    },

    /**
     * Deletes the specified user on the server.
     *
     * @param args.id The id of the user that should be deleted
     * @param args.callback Callback function which will be called after the request returns
     * @return True if the arguments were correct, false otherwise
     */
    deleteUser : function (args) {
        if (!args || !args.id || isNaN(args.id))
            return false;
        this.send({
            suffix : 'deleteuser?id=' + args.id,
            request : '',
            callback : _.isFunction(args.callback) ? args.callback : null
        });

        return true;
    },

    /**
     * Requests the nearest valid neighbouring point on a street for the given point.
     *
     * @param args.points A list of points for which neighbours should be searched
     * @param args.callback Callback function which will be called after the request returns
     * @return True if the arguments were correct, false otherwise
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

    /**
     * Sends an algorithm calculation request to the server.
     *
     * Use either args.request or args.point, args.version and args.contraints.
     *
     * @param args.alg The shortname of the desired algorithm
     * @param args.request A complete request object according to the specification
     * @param args.points The points supplied to the algorithm
     * @param args.version The requested version of the algorithm
     * @param args.constraints Constraints that need to be applied to the algorithm
     * @param args.callback Callback function which will be called after the request returns
     * @return True if the arguments were correct, false otherwise
     */
    alg : function (args) {
        var thisrequest = {};
        if (!args || !args.alg)
            return false;
        // use given request or make own
        if (args.request) {
            if (!args.request.points)
                return false;
            else
                thisrequest = args.request;

        } else {
            if (!args.points)
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

    /**
     * Retrieve a single request from the server.
     *
     * @param args.id The id of the request
     * @param args.callback Callback function which will be called after the request returns
     * @return True if the arguments were correct, false otherwise
     */
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
