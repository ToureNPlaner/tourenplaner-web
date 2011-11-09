// Uses jQuery.mockjax to mock the JSON REST API of the server

$.mockjaxSettings.log = function(msg) { log(msg); }

/**
 * Mocks the /info function on the server.
 *
 * Returns an example info response.
 */
$.mockjax({
    url: "/info",
    status: 200,
    responseTimeout: 100,
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
    status: 200,
    responseTimeout: 200,
    responseText: "",
    response: function(settings) {
        if (_.isUndefined(settings.data.email) || _.isUndefined(settings.data.password) || _.isUndefined(settings.data.firstname) || _.isUndefined(settings.data.lastname) || _.isUndefined(settings.data.address) || settings.data.email == "" || settings.data.password == "") {
            this.status = 400;
            this.responseText = {
                errorid: "ENOTVALID",
                message: "Validation error",
                details: "Empty argument"
            };
        }
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
    status: 200,
    response: function(data) {
        if (!_.isUndefined(data.headers.Authorization) && _.isEqual(data.headers.Authorization, Base64.encode('asd@asd.de:asd'))) {
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
            this.responseText = {
                errorid: "EAUTH",
                message: "Wrong email or password",
                details: ""
            };
        }
    }
});

/**
 * Mocks the /getuser function on the server.
 *
 * Returns user object.
 */
$.mockjax({
    url: "/getuser",
    responseTimeout: 10,
    status: 201,
    response: function(data) {
            this.responseText = {
                username: 'asd',
                password: 'asd',
                email: 'asd@asd.de',
                firstname: 'Peter',
                lastname: 'Lustig',
                admin: true,
                active: true
            }

    }
});

/**
 * Mocks the /getuser?ID=42 function on the server.
 *
 * Returns user object.
 */
$.mockjax({
    url: "/getuser?ID=42",
    responseTimeout: 10,
    status: 201,
    response: function(data) {
            this.responseText = {
                username: 'qwe',
                password: 'qwe',
                email: 'qwe@ewq.de',
                firstname: 'Donald',
                lastname: 'Duck',
                admin: false,
                active: true
            }
    }
});

/**
 * Mocks the /updateuser function on the server.
 *
 * Returns user object.
 */
$.mockjax({
    url: "/updateuser",
    responseTimeout: 10,
    status: 201,
    response: function(data) {
            this.responseText = {
                username: data.data.username,
                password: data.data.password,
                email: data.data.email,
                firstname: data.data.firstname,
                lastname: data.data.lastname,
                admin: false,
                active: true
            };
    }
});

/**
 * Mocks the /updateuser?ID=42 function on the server.
 *
 * Returns user object.
 */
$.mockjax({
    url: "/updateuser?ID=42",
    responseTimeout: 10,
    status: 201,
    response: function(data) {
            this.responseText = {
                username: data.data.username,
                password: data.data.password,
                email: data.data.email,
                firstname: data.data.firstname,
                lastname: data.data.lastname,
                admin: false,
                active: true
            };
    }
});

/**
 * Mocks the /listrequests?Limit=2&Offset=3 function on the server.
 *
 * Returns request list.
 */
$.mockjax({
    url: "/listrequests?Limit=2&Offset=3",
    responseTimeout: 10,
    status: 201,
    response: function(data) {
            this.responseText = {
                number: 100,
                requests: [{
                    timestamp: 1234567890,
                    duration: 500,
                    cost: 123.24,
                    request: {Request: [[48.781667, 9.1752781], [52.518056, 13.393333]]},
                    response: {Route:[[3.1427,90.1487],[28.1427,20.1567],
                    [17.1978,86.1487],[42.5927,129.4667],[89.1427,1.0847]]}
                },{
                    timestamp: 987654321,
                    duration: 741,
                    cost: 12.90,
                    request: {Request: [[52.518056, 13.393333], [48.781667, 9.1752781]]},
                    response: {Route:[[28.1427,20.1567],[89.1427,1.0847],
                    [17.1978,86.1487],[3.1427,90.1487],[42.5927,129.4667]]}
                }]
            };
    }
});

/**
 * Mocks the /listrequests?Limit=1&Offset=3 function on the server.
 *
 * Returns request list.
 */
$.mockjax({
    url: "/listrequests?ID=1024&Limit=1&Offset=1032",
    responseTimeout: 10,
    status: 201,
    response: function(data) {
            this.responseText = {
                number: 100,
                requests: [{
                    timestamp: 1234567890,
                    duration: 500,
                    cost: 123.24,
                    request: {Request: [[48.781667, 9.1752781], [52.518056, 13.393333]]},
                    response: {Route:[[3.1427,90.1487],[28.1427,20.1567],
                    [17.1978,86.1487],[42.5927,129.4667],[89.1427,1.0847]]}
                }]
            };
    }
});

/**
 * Mocks the /listusers?Limit=1&Offset=3 function on the server.
 *
 * Returns user list.
 */
$.mockjax({
    url: "/listusers?Limit=1&Offset=3",
    responseTimeout: 10,
    status: 201,
    response: function(data) {
            this.responseText = {
                number: 100,
                requests: [{
                    email: "max.mustermann@online.de",
                    password: "1234",
                    firstname: "Max",
                    lastname: "Mustermann",
                    address: "Musterstrasse 10, 12345 Musterstadt",
                    admin: false,
                    active: true
                }]
            };
    }
});


/**
 * Mocks the /deleteuser?ID=94 function on the server.
 */
$.mockjax({
    url: "/deleteuser?ID=94",
    responseTimeout: 10,
    status: 201,
    response: function(data) {
            this.responseText = {
            };
    }
});


/**
 * Mocks the /alg$sp function on the server.
 *
 * Returns alg response.
 */
$.mockjax({
    url: "/alg$sp",
    responseTimeout: 10,
    status: 201,
    response: function(data) {
            var a = Math.random() * 90;
            var b = Math.random() * 90;
            var c = Math.random() * 90;
            var d = Math.random() * 90;
            this.responseText = {
                points: [
                    {lt: a, ln: b},
                    {lt: c, ln: d},
                    {lt: 48.8485554, ln: 9.418236}
                ],
                misc: {
                    distance: 100,
                    apx: 0.5
                }
            };
    }
});
