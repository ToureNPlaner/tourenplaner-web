window.Api = {

    defaults: {
        authAsBase64 : '', // provides username+password Base64 encoded
        authRequired : false,
        server : 'http://localhost', // url of the server
        port : '8081' // port on which the server listens    
    },

    /* send
     * sends given request to server. with or without authentication
     * param: type chooses how the request should be send. POST or GET.
     * param: urlSuffix chooses algorithm, info or modi 
     * param: requestString contains the request
     * return response by server - generalley as json
     */
    send : function (type, urlSuffix, requestString) {
        var url = this.server + ':' + this.port + '/' + urlSuffix;
        
        if (this.authRequired) {
            // method performs an asyncronous HTTP request with authentication.
            // use success function and jqHXR.reponseText to handle received data
            return $.ajax({
                url: url,
                cache: false,
                type: type,
                accepts: 'json',
                headers: {'Authorization' : this.authAsBase64},
                data: requestString,
                success: function (data, textStatus, jqXHR) {
                    // Get responding route with: "jqXHR.responseText"
                    return jqXHR.responseText;
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert(textStatus + ": " + errorThrown);
                }
            });
        } else {
            // method performs an asyncronous HTTP request without authentication.
            // use success function and jqHXR.reponseText to handle received data
            return $.ajax({
                url: url,
                cache: false,
                type: type,
                accepts: 'json',
                data: requestString,
                success: function (data, textStatus, jqXHR) {
                    // Get responding route with: "jqXHR.responseText"
                    alert(jqXHR.responseText);
                    return jqXHR.responseText;
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert(textStatus + ": " + errorThrown);
                }
            });
        }
    },

    /* serverInformation
     * aks' server for information about the server
     */
    serverInformation : function () {
        return this.send('GET', 'info', '');  
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
    authUser : function (username, password) {
        return this.send('GET', 'authuser',
                         {username: username, password: password});
    },
    
    /* getUser
     * get user data by id or own data.
     * param: id of requested user, null for own data
     */
    getUser : function (id) {
        if (id === null) {
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
        if (id === null) {
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
        if (id === null) {
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
};
