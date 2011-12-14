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
        servertype: "private",
        sslport: 1515,
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
        var obj = settings.data;
       	if (_.isString(obj))
       	 	obj = JSON.parse(obj);
        if (_.isUndefined(obj.email) || _.isUndefined(obj.password) || _.isUndefined(obj.firstname) || _.isUndefined(obj.lastname) || _.isUndefined(obj.address) || obj.email == "" || obj.password == "") {
            this.status = 400;
            this.responseText = {
                errorid: "ENOTVALID",
                message: "Validation error",
                details: "Empty argument"
            };
        } else{
	        this.responseText = {}
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
        var login = data.headers.Authorization.split(' ')[1];
        if (_.isEqual(login, Base64.encode('asd@asd.de:asd'))) {
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
    		var obj = data.data;
    	   	if (_.isString(obj))
    	   	 	obj = JSON.parse(obj);
            this.responseText = {
                username: obj.username,
                password: obj.password,
                email: obj.email,
                firstname: obj.firstname,
                lastname: obj.lastname,
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
    		var obj = data.data;
    	   	if (_.isString(obj))
    	   	 	obj = JSON.parse(obj);
            this.responseText = {
                username: obj.username,
                password: obj.password,
                email: obj.email,
                firstname: obj.firstname,
                lastname: obj.lastname,
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
 * Mocks the /algsp function on the server.
 *
 * Returns alg response.
 */
$.mockjax({
    url: "/algsp",
    responseTimeout: 10,
    status: 201,
    response: function(data) {
            var a = Math.floor(Math.random() * 90 * 1e7);
            var b = Math.floor(Math.random() * 90 * 1e7);
            var c = Math.floor(Math.random() * 90 * 1e7);
            var d = Math.floor(Math.random() * 90 * 1e7);
            this.responseText = {
                points: [
                    {lt: a, ln: b},
                    {lt: c, ln: d},
                    {lt: 488485554, ln: 94182360}
                ],
                misc: {
                    distance: 100,
                    apx: 0.5
                }
            };
    }
});

/**
 * Mocks the /alg function on the server. For no algorithm chosen.
 *
 * Returns failure response.
 */
$.mockjax({
    url: "/alg",
    responseTimeout: 10,
    status: 201,
    response: function(data) {
    }
});

/**
 * Mocks the /nns function on the server.
 *
 * Returns the given point as the nearest neighbor.
 */
$.mockjax({
    url: "/algnns",
    responseTimeout: 10,
    status: 200,
    response: function (data) {
        var tmp = JSON.parse(data.data);
        tmp.ln *= 1e7;
        tmp.lt *= 1e7;
        this.responseText = tmp;
    }
});
