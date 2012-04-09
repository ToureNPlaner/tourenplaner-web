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
                details: {
                    hidden: false,
                    minpoints: 2,
                    sourceistarget: false
                },
                pointconstraints: [
                    {
                        id: "height",
                        name: "height",
                        description: "Höhenmeter",
                        type: "meter",
                        min: 0.0,
                        max: 2000.0
                    },{
                        id: "boolconstraint",
                        name: "BoolConstraint",
                        description: "......",
                        type: "boolean",
                        min: 0.0,
                        max: 2000.0
                    },{
                        id: "priceconstraint",
                        name: "PriceConstraint",
                        type: "price",
                        description: "Preis...",
                        min: 0.0,
                        max: 2000.0
                    }
                ],
                constraints: [
                ]
            },{
                version: 2,
                name: "Traveling Salesman",
                urlsuffix: "tsp",
                details: {
                    hidden: false,
                    minpoints: 2,
                    sourceistarget: true
                },
                pointconstraints: [
                    {
                        name: "height",
                        type: "meter",
                        min: 0.0,
                        max: 2000.0
                    },{
                        name: "BoolConstraint",
                        type: "boolean",
                        min: 0.0,
                        max: 2000.0
                    },{
                        name: "PriceConstraint",
                        type: "price",
                        min: 0.0,
                        max: 2000.0
                    }
                ],
                constraints: [
                ]
            },{
                version: 2,
                name: "Constrained Shortest Path",
                urlsuffix: "csp",
                details: {
                    hidden: false,
                    minpoints: 2,
                    sourceistarget: false
                },
                pointconstraints: [
                    {
                        name: "height",
                        type: "meter",
                        min: 0.0,
                        max: 2000.0
                    },{
                        name: "BoolConstraint",
                        type: "boolean",
                        min: 0.0,
                        max: 2000.0
                    },{
                        name: "PriceConstraint",
                        type: "price",
                        min: 0.0,
                        max: 2000.0
                    }
                ],
                constraints: [
                    {
                        name: "Max Altitude Difference",
                        id: "maxAltitudeDifference",
                        description: "The maximum difference in altitude combined over the path",
                        type: "meter",
                        min: 0
                    }
                ]
            },{
                version: 7,
                name: "Another Testalgorithm",
                urlsuffix: "ata",
                details: {
                    hidden: false,
                    minpoints: 3,
                    sourceistarget: false
                },
                pointconstraints: [],
                constraints: [
                    {
                        "id": "transportation",
                        "name": "Type of Transportation",
                        "description": "The Kind of transportation to use.",
                        "type": "enum",
                        "values": ["Foot", "Bicycle", "Car"]
                    },{
                        "name": "Max Altitude Difference",
                        "id": "maxAltitudeDifference",
                        "description": "The maximum difference in altitude combined over the path",
                        "type": "meter",
                        "min": 0
                    },{
                        "id": "randomBoolConstraint",
                        "name": "Random Boolean Constraint",
                        "description": "...",
                        "type": "boolean"
                    }

                ]
            },{
                version: 2,
                name: "Nearest Neighbor",
                urlsuffix: "nns",
                details: {
                    hidden: true,
                    minpoints: 1,
                    sourceistarget: false
                },
                pointconstraints: [
                ],
                constraints: [
                ]
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
    response: function(settings) {
        var obj = settings.data;
       	if (_.isString(obj))
       	 	obj = JSON.parse(obj);

        if (_.isUndefined(obj.email) || _.isUndefined(obj.password) || _.isUndefined(obj.firstname) || _.isUndefined(obj.lastname) || _.isUndefined(obj.address) || obj.email == "" || obj.password == "") {
            this.status = 400;
            this.responseText = {
                errorid: "ENOTVALid",
                message: "Validation error",
                details: "Empty argument"
            };
        } else {
	        this.responseText = {}
        }
    }
});

/**
 * Mocks the /authuser function on the server.
 *
 * For email = 'root@tourenplaner.de' and password = 'toureNPlaner' it returns a user object, otherwise it returns an error code and text.
 */
$.mockjax({
    url: "/authuser",
    responseTimeout: 10,
    status: 200,
    response: function(data) {
        if(!_.isUndefined(data.headers.Authorization)){
            var login = data.headers.Authorization.split(' ')[1];
            if (_.isEqual(login, Base64.encode('root@tourenplaner.de:toureNPlaner'))) {
                this.responseText = {
                    userid: 42,
                    username: 'root@tourenplaner.de',
                    email: 'root@tourenplaner.de',
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
        else return false;
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
    responseText: {
                userid: 42,
                username: 'asd',
                password: 'asd',
                email: 'asd@asd.de',
                firstname: 'Peter',
                lastname: 'Lustig',
                admin: true,
                active: true
    }
});

/**
 * Mocks the /getuser?id=* function on the server.
 *
 * Returns user object.
 */
$.mockjax({
    url: "/getuser?id=*",
    responseTimeout: 10,
    status: 201,
    responseText: {
                userid: 13,
                username: 'qwe',
                password: 'qwe',
                email: 'qwe@ewq.de',
                firstname: 'Donald',
                lastname: 'Duck',
                admin: false,
                active: true
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
 * Mocks the /updateuser?id=* function on the server.
 *
 * Returns user object.
 */
$.mockjax({
    url: "/updateuser?id=*",
    responseTimeout: 10,
    status: 201,
    response: function(data) {
    		var obj = data.data;
    	   	if (_.isString(obj))
    	   	 	obj = JSON.parse(obj);
            this.responseText = {
                userid: 42,
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
 * Mocks the /listrequests?limit=2&offset=3 function on the server.
 *
 * Returns request list.
 */
$.mockjax({
    url: "/listrequests?limit=*&offset=*",
    responseTimeout: 10,
    status: 201,
    responseText: {
                number: 100,
                requests: [{
                	requestid: 0,
                	userid: 42,
                	algorithm: "sp",
                    request: {"points": [{"lt":487816670, "ln":91752781}, {"lt":525180560, "ln":133933330}]},
                    response: {"way":[{"lt":487816670, "ln":91752781},{"lt":48702700,"ln":91706700},
                    {"lt":171978000,"ln":861487000},{"lt":425927000,"ln":124667000},{"lt":525180560, "ln":133933330}]},
                    cost: 123.24,
                    requestdate: "2011-12-11T13:55:30.000+0000",
                    finisheddate: "2011-12-11T13:55:56.000+0000",
                    duration: 500,
                    status: "OK"
                },{
                	requestid: 1,
                	userid: 1,
                	algorithm: "nns",
                	request: {"points": [{"lt":525180560, "ln":133933330}, {"lt":487816670, "ln":91752781}]},
                    response: {"way":[{"lt":525180560,"ln":133933330},{"lt":281427000,"ln":201567000},
                    {"lt":171978000,"ln":861487000},{"lt":425927000,"ln":1294667000},{"lt":487816670,"ln":91752781}]},
                    cost: 12.90,
                    requestdate: "2011-12-11T13:55:30.000+0000",
                    finisheddate: null,
                    duration: 42,
                    status: "Failed"
                }]
    }
});

/**
 * Mocks the /listrequests?limit=1&offset=3 function on the server.
 *
 * Returns request list.
 */
$.mockjax({
    url: "/listrequests?limit=1&offset=1032&id=1024",
    responseTimeout: 10,
    status: 201,
    responseText: {
                number: 100,
                requests: [{
                    requestid: 1,
                    userid: 1,
                    algorithm: "nns",
                    request: {"points": [{"lt":525180560, "ln":133933330}, {"lt":487816670, "ln":91752781}]},
                    response: {"way":[{"lt":525180560,"ln":133933330},{"lt":281427000,"ln":201567000},
                    {"lt":171978000,"ln":861487000},{"lt":425927000,"ln":1294667000},{"lt":487816670,"ln":91752781}]},
                    cost: 12.90,
                    requestdate: "2011-12-11T13:55:30.000+0000",
                    finisheddate: null,
                    duration: 42,
                    status: "Pending"
                }]
    }
});

/**
 * Mocks the /listusers?limit=*&offset=* function on the server.
 *
 * Returns user list.
 */
$.mockjax({
    url: "/listusers?limit=*&offset=*",
    responseTimeout: 10,
    status: 201,
    response: function(data) {
            var user = {
                    userid: 1,
                    email: "max.mustermann@online.de",
                    password: "1234",
                    firstname: "Max",
                    lastname: "Mustermann",
                    address: "Musterstrasse 10, 12345 Musterstadt",
                    admin: false,
                    status: "verified",
                    resitrationdate: "2011-12-11T13:55:30.000+0000",
                    verifieddate: null
            };
            var user2 = _.extend({}, user, {status: "needs verification", userid: 2});

            this.responseText = {
                number: 10,
                users: [user, user, user2, user, user, user, user2, user, user, user]
            };
    }
});


/**
 * Mocks the /deleteuser?id=94 function on the server.
 */
$.mockjax({
    url: "/deleteuser?id=*",
    responseTimeout: 10,
    status: 201,
    responseText: {}
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
                requestid: 42,
                way: [[
                    {lt: a, ln: b},
                    {lt: c, ln: d},
                    {lt: 488485554, ln: 94182360}
                ]],
                points: [
                    {lt: a, ln: b, name: "Marker A"},
                    {lt: c, ln: d, name: "Marker B"}
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
    responseText: {}
});

/**
 * Mocks the /nns function on the server.
 *
 * Returns the given point as the nearest neighbor.
 */
$.mockjax({
    url: "/algnns",
    responseTimeout: 100,
    status: 200,
    response: function (data) {
        var arr = JSON.parse(data.data)
        var tmp = { way: [] };
        for (i in arr.points)
            tmp.way.push(arr.points[i]);

        this.responseText = tmp;
    }
});

/**
 * Mocks the /getrequest function on the server.
 *
 * Returns a random route.
 */
$.mockjax({
    url: "/getrequest?id=*",
    status: 200,
    responseTimeout: 200,
    response: function (data) {
            var a = Math.floor(Math.random() * 90 * 1e7);
            var b = Math.floor(Math.random() * 90 * 1e7);
            var c = Math.floor(Math.random() * 90 * 1e7);
            var d = Math.floor(Math.random() * 90 * 1e7);
            this.responseText = {
                version: 1,
                points: [
                    {lt: a, ln: b, k: 100},
                    {lt: c, ln: d, k: 100}
                ],
                constraints: {}
            };
    }
});

/**
 * Mocks the /getresponse function on the server.
 *
 * Returns a random route.
 */
$.mockjax({
    url: "/getresponse?id=*",
    status: 200,
    responseTimeout: 200,
    response: function (data) {
            var a = Math.floor(Math.random() * 90 * 1e7);
            var b = Math.floor(Math.random() * 90 * 1e7);
            var c = Math.floor(Math.random() * 90 * 1e7);
            var d = Math.floor(Math.random() * 90 * 1e7);
            this.responseText = {
                requestid: 42,
                constraints: {},
                points: [
                    {lt: a, ln: b, k: 100},
                    {lt: c, ln: d, k: 100}
                ],
                way: [
                    [{lt: a, ln: b},{lt: a, ln: c}],
                    [{lt: a, ln: c},{lt: c, ln: d}]
                ],
                misc: {distance: 100, apx: 0.5}
            };
    }
});
