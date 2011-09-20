// Uses jQuery.mockjax to mock the JSON REST API of the server

$.mockjaxSettings.log = function(msg) { log(msg); }

/**
 * Mocks the /info function on the server.
 *
 * Returns an example info response.
 */
$.mockjax({
    url: "/info",
    responseText: {
        version: "1.0",
        servertype: "public",
        sslport: 443,
        algorithms: [
            {
                version: 2,
                name: "Shortest Path",
                urlsuffix: "sp",
                pointconstraints: [
                    {
                        name: "height",
                        type: "meter",
                        min: 0.0,
                        max: 2000.0
                    }
                ],
                constraints: {
                    minPoints: 2,
                    sourceIsTarget: false
                }
            }
        ]
    }
});

/**
 * Mocks the /registeruser function on the server.
 *
 *
 */
$.mockjax({
    url: "/registeruser",
    response: function(data) {

    }
});

/**
 * Mocks the /authuser function on the server.
 *
 * For email = 'asd@asd.de' and password = 'asd' it returns a user object, otherwise it returns an error code and text.
 */
$.mockjax({
    url: "/authuser",
    responseTimeout: 10,
    status: 201,
    response: function(data) {
        if (!_.isUndefined(data.headers.Authorization) && _.isEqual(data.headers.Authorization, Base64.encode('asd@asd.de:asd'))) {
            this.status = 205;
            this.responseText = {
                username: 'asd',
                password: 'asd',
                email: 'asd@asd.de',
                firstname: 'Peter',
                lastname: 'Lustig',
                admin: true,
                active: true
            }
        } else {
            this.status = 401;
            this.responseText = 'Benutzername oder Passwort falsch';
        }
    }
});
