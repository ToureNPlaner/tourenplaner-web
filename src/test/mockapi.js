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
                constraints: {
                    minPoints: 2,
                    sourceIsTarget: false
                }
            },{
                version: 2,
                name: "Traveling Salesman",
                urlsuffix: "tsp",
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
                constraints: {
                    minPoints: 2,
                    sourceIsTarget: false
                }
            },
            {
                version: 1,
                hidden: true,
                name: 'Hidden Algorithm',
                urlsuffix: 'hidden',
                pointconstraints: [],
                constraints: {}
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
                errorid: "ENOTVALID",
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
        var login = data.headers.Authorization.split(' ')[1];
        if (_.isEqual(login, Base64.encode('root@tourenplaner.de:toureNPlaner'))) {
            this.responseText = {
                username: 'root@tourenplaner.de',
                password: 'toureNPlaner',
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
 * Mocks the /getuser?ID=* function on the server.
 *
 * Returns user object.
 */
$.mockjax({
    url: "/getuser?ID=*",
    responseTimeout: 10,
    status: 201,
    responseText: {
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
 * Mocks the /updateuser?ID=* function on the server.
 *
 * Returns user object.
 */
$.mockjax({
    url: "/updateuser?ID=*",
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
    url: "/listrequests?Limit=*&Offset=*",
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
                    costs: 123.24,
                    ispaid: true,
                    requestdate: "2011-12-11T13:55:30Z",
                    finisheddate: "2011-12-11T13:56:14Z",
                    duration: 500,
                    status: "OK"
                },{
                	requestid: 1,
                	userid: 1,
                	algorithm: "nns",
                	request: {"points": [{"lt":525180560, "ln":133933330}, {"lt":487816670, "ln":91752781}]},
                    response: {"way":[{"lt":525180560,"ln":133933330},{"lt":281427000,"ln":201567000},
                    {"lt":171978000,"ln":861487000},{"lt":425927000,"ln":1294667000},{"lt":487816670,"ln":91752781}]},
                    costs: 12.90,
                    ispaid: false,
                    requestdate: "2011-12-11T13:55:30Z",
                    finisheddate: null,
                    duration: 42,
                    status: "Failed"
                }]
    }
});

/**
 * Mocks the /listrequests?Limit=1&Offset=3 function on the server.
 *
 * Returns request list.
 */
$.mockjax({
    url: "/listrequests?Limit=1&Offset=1032&ID=1024",
    responseTimeout: 10,
    status: 201,
    responseText: {
                number: 100,
                requests: [{
                	requestid: 0,
                	userid: 42,
                	algorithm: "sp",
                	request: {"points": [{"lt":525180560, "ln":133933330}, {"lt":487816670, "ln":91752781}]},
                    response: {"way":[{"lt":525180560,"ln":133933330},{"lt":535180560,"ln":143933330},
                    {"lt":171978000,"ln":861487000},{"lt":425927000,"ln":1294667000},{"lt":487816670,"ln":91752781}]},
                    costs: 123.24,
                    ispaid: true,
                    requestdate: "2011-12-11T13:55:30Z",
                    finisheddate: null,
                    duration: 500,
                    status: "Pending"
                }]
    }
});

/**
 * Mocks the /listusers?Limit=*&Offset=* function on the server.
 *
 * Returns user list.
 */
$.mockjax({
    url: "/listusers?Limit=*&Offset=*",
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
                    active: true
            };
            var user2 = _.extend({}, user, {active: false, userid: 2});

            this.responseText = {
                number: 10,
                requests: [user, user, user2, user, user, user, user2, user, user, user]
            };
    }
});


/**
 * Mocks the /deleteuser?ID=94 function on the server.
 */
$.mockjax({
    url: "/deleteuser?ID=*",
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
                way: [
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
    responseText: {}
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
        var arr = JSON.parse(data.data)
        var tmp = { way: [] };
        for (i in arr.points)
            tmp.way.push(arr.points[i]);

        this.responseText = tmp;
    }
});
