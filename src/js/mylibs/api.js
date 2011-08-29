window.Api = Backbone.View.extend({

    defaults: {
        authAsBase64 : '', // provides username+password Base64 encoded
        authRequired : false,
        server : 'http://localhost', // url of the server
        port : '8081' // port on which the server listens    
    },

    /* send
     * sends given request to server. with or without authentication
     * param: urlSuffix chooses algorithm, info or modi 
     * param: requestString contains the request
     * return response by server - generalley as json
     */
    send : function (urlSuffix, requestString) {
        var url = this.server + ':' + this.port + '/' + urlSuffix;
        
        if (this.authRequired) {
            // method performs an asyncronous HTTP request with authentication.
            // use success function and jqHXR.reponseText to handle received data
            return $.ajax({
                url: url,
                cache: false,
                type: 'POST',
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
                type: 'POST',
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
        return this.send('info', '');  
    },
    
    /* registerUser
     * creates new user account
     */
// wird userObject übergeben?
    registerUser: function (userObject) {
        return this.send('registeruser', userObject);
    },
    
    /* authUser
     * confirmes user.
     */
    authUser : function () {
        return this.send('authuser', '');
    },
    
    /* getUser
     * get user data by id or own data.
     * param: id of requested user, null for own data
     */
    getUser : function (id) {
        if (id === null) {
            return this.send('getuser', '');
        } else {
            return this.send('getuser?ID=' + id, '');
        }
    },
    
    /* updateUser
     * change user data by id or own
     * param: id of user you want to change, null if to change own
     */
    updateUser : function (id, userObject) {
        if (id === null) {
            return this.send('updateuser', userObject);
        } else {
            return this.send('updateuser?ID=' + id, userObject);
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
            return this.send('listrequests?Limit=' + limit +
                             '&Offset=' + offset, '');
        } else {
            return this.send('listrequests?ID=' + id +
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
        return this.send('listusers?Limit=' + limit + '&Offset=' + offset, '');
    },
    
    /* deleteUser
     * deletes user from server
     * param: id of user that should be deleted
     */
    deleteUser : function (id) {
        return this.send('deleteuser?ID=' + id, '');
    },
    
    /* alg
     * sends algorithm calculation request
     * param: alg shortname of desired alg
     * param: request contains problem instance (format as alg specification)
     */
    alg : function (alg, request) {
        return this.send('alg$' + alg, request);
    }
});
