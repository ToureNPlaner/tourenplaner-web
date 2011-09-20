window.Api = {
    defaults: {
        authAsBase64 : '', // provides username+password Base64 encoded
        authRequired : false,
        server : 'http://localhost', // url of the server
        port : '8081' // port on which the server listens    
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
        var url, event;
        url = this.server + ':' + this.port + '/' + reqData.suffix;
        event = {}; // needed to bind ajax-event on it
        _.extend(event, Backbone.Events); // init event for events
        event.bind('request', reqData.callback);

        // method performs an asyncronous HTTP request with or without
        // authentication. 
        // performs a callback, successful or not
        $.ajax({
            url: url,
            cache: false,
            type: reqData.type,
            accepts: 'json',
            data: reqData.request,
            beforeSend: function (jqXHR, settings) {
		        if (this.authRequired) {
		            jqXHR.setRequestHeader('Authorization', this.authAsBase64);
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
        callbackHandler = function (response, successful) {if (successful) {/*do something with your answer*/} else {/*handle error*/} };
        reqData = {type : 'GET', suffix : 'info', request : '', callback : callbackHandler};
        this.send(reqData);
    },
    /* registerUser
     * creates new user account
     */
    registerUser: function (userObject) {
        var callbackHandler, reqData;
        callbackHandler = function (response, successful) {if (successful) {/*do something with your answer*/} else {/*handle error*/} };
        reqData = {type : 'POST', suffix : 'registeruser', request : userObject, callback : callbackHandler};
        this.send(reqData);
    },
    /* authUser
     * confirmes user.
     */
    authUser : function (username, password) {
        var callbackHandler, reqData;
        callbackHandler = function (response, successful) {if (successful) {/*do something with your answer*/} else {/*handle error*/} };
        reqData = {type : 'GET', suffix : 'authuser', request : {username: username, password: password}, callback : callbackHandler};
        this.send(reqData);
    },
    /* getUser
     * get user data by id or own data.
     * param: id of requested user, null for own data
     */
    getUser : function (id) {
        var callbackHandler, reqData;
        if (id === null) {
            callbackHandler = function (response, successful) {if (successful) {/*do something with your answer*/} else {/*handle error*/} };
            reqData = {type : 'GET', suffix : 'getuser', request : '', callback : callbackHandler};
        } else {
            callbackHandler = function (response, successful) {if (successful) {/*do something with your answer*/} else {/*handle error*/} };
            reqData = {type : 'GET', suffix : 'getuser?ID=' + id, request : '', callback : callbackHandler};
        }
        this.send(reqData);
    },
    /* updateUser
     * change user data by id or own
     * param: id of user you want to change, null if to change own
     */
    updateUser : function (id, userObject) {
        var callbackHandler, reqData;
        if (id === null) {
            callbackHandler = function (response, successful) {if (successful) {/*do something with your answer*/} else {/*handle error*/} };
            reqData = {type : 'POST', suffix : 'updateuser', request : userObject, callback : callbackHandler};
        } else {
            callbackHandler = function (response, successful) {if (successful) {/*do something with your answer*/} else {/*handle error*/} };
            reqData = {type : 'POST', suffix : 'updateuser?IID=' + id, request : userObject, callback : callbackHandler};
        }
        this.send(reqData);
    },
    /* listRequests
     * lists all requests that have been made
     * param: id of single user, null if general request
     * param: limit max number of items
     * param: offset of first item
     */
    listRequest : function (id, limit, offset) {
        var callbackHandler, reqData;
        if (id === null) {
            callbackHandler = function (response, successful) {if (successful) {/*do something with your answer*/} else {/*handle error*/} };
            reqData = {type : 'POST', suffix : 'listrequests?Limit=' + limit + '&Offset=' + offset, request : '', callback : callbackHandler};
        } else {
            callbackHandler = function (response, successful) {if (successful) {/*do something with your answer*/} else {/*handle error*/} };
            reqData = {type : 'POST', suffix : 'listrequests?ID=' + id + '&Limit=' + limit + '&Offset=' + offset, request : '', callback : callbackHandler};
        }
        this.send(reqData);
    },
    /* listUsers
     * lists user from server
     * param: limit max numbers of users
     * param: offset of first user
     */
    listUser : function (limit, offset) {
        var callbackHandler, reqData;
        callbackHandler = function (response, successful) {if (successful) {/*do something with your answer*/} else {/*handle error*/} };
        reqData = {type : 'GET', suffix : 'listusers?Limit=' + limit + '&Offset=' + offset, request : '', callback : callbackHandler};
        this.send(reqData);
    },
    /* deleteUser
     * deletes user from server
     * param: id of user that should be deleted
     */
    deleteUser : function (id) {
        var callbackHandler, reqData;
        callbackHandler = function (response, successful) {if (successful) {/*do something with your answer*/} else {/*handle error*/} };
        reqData = {type : 'GET', suffix : 'deleteuser?ID=' + id, request : '', callback : callbackHandler};
        this.send(reqData);
    },
    /* alg
     * sends algorithm calculation request
     * param: alg shortname of desired alg
     * param: request contains problem instance (format as alg specification)
     */
    alg : function (alg, request) {
        var callbackHandler, reqData;
        callbackHandler = function (response, successful) {if (successful) {/*do something with your answer*/} else {/*handle error*/} };
        reqData = {type : 'POST', suffix : 'alg$' + alg, request : request, callback : callbackHandler};
        this.send(reqData);
    }
};
