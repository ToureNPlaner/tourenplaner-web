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
                    minPoints: 2,
                    sourceIsTarget: false
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
                name: "Traveling Salesman",
                urlsuffix: "tsp",
                details: {
                    hidden: false,
                    minPoints: 2,
                    sourceIsTarget: true
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
                    minPoints: 2,
                    sourceIsTarget: false
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
                        name: "maxAltitudeDifference",
                        description: "The maximum difference in altitude combined over the path",
                        type: "meter",
                        min: 0
                    }
                ]
            },{
                version: 2,
                name: "Nearest Neighbor",
                urlsuffix: "nns",
                details: {
                    hidden: true,
                    minPoints: 1,
                    sourceIsTarget: false
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
 * Mocks the /getuser?id=* function on the server.
 *
 * Returns user object.
 */
$.mockjax({
    url: "/getuser?id=*",
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
                requestid: 42,
                userid: 24,
                algorithm: "tsp",
                cost: 0,
                requestdate: "2012-02-12T00:00:00.000+0000",
                finisheddate: "2012-02-12T00:00:00.000+0000",
                duration: 1,
                status: "ok",
                request: "eyJ2ZXJzaW9uIjoxLCJwb2ludHMiOlt7ImxuIjo4MjQyMjA3MywibHQiOjUwMDc5MTcwOSwibmFtZSI6Ik1hcmtlciBBIiwicG9zaXRpb24iOjAsImsiOiIifSx7ImxuIjo4MzI3NjE4NywibHQiOjUwMTQ2NjA1NywibmFtZSI6Ik1hcmtlciBCIiwicG9zaXRpb24iOjEsImsiOiIifV0sImNvbnN0cmFpbnRzIjp7fX0=",
                response: "eyJjb25zdHJhaW50cyI6e30sInBvaW50cyI6W3sibHQiOjUwMDc5MTcwOSwibG4iOjgyNDIyMDczLCJwb3NpdGlvbiI6MCwibmFtZSI6Ik1hcmtlciBBIiwiZGlzdFRvUHJldiI6MTIxMzQsImsiOiIifSx7Imx0Ijo1MDE0NjYwNTcsImxuIjo4MzI3NjE4NywicG9zaXRpb24iOjEsIm5hbWUiOiJNYXJrZXIgQiIsImsiOiIifV0sIndheSI6W3sibHQiOjUwMDc5MTcwOSwibG4iOjgyNDIyMDczfSx7Imx0Ijo1MDA3OTIxNzksImxuIjo4MjQzMzAxN30seyJsdCI6NTAwNzkyNDcwLCJsbiI6ODI0MzgyODR9LHsibHQiOjUwMDc5MzIyNywibG4iOjgyNDUwMzAyfSx7Imx0Ijo1MDA3OTMyNDYsImxuIjo4MjQ1MjI3M30seyJsdCI6NTAwNzkzMzgxLCJsbiI6ODI0NTY3NTh9LHsibHQiOjUwMDc5MzU5MiwibG4iOjgyNDU4Mjg1fSx7Imx0Ijo1MDA3OTUxNjQsImxuIjo4MjQ2Mjk2OH0seyJsdCI6NTAwNzk2ODQyLCJsbiI6ODI0NjU1Mjd9LHsibHQiOjUwMDc5ODg0MiwibG4iOjgyNDY4NjM1fSx7Imx0Ijo1MDA4MDAwNzgsImxuIjo4MjQ3MDY2M30seyJsdCI6NTAwODAxNDA1LCJsbiI6ODI0NzYxMTZ9LHsibHQiOjUwMDgwMjAyMSwibG4iOjgyNDc4NTI1fSx7Imx0Ijo1MDA4MDY3MjksImxuIjo4MjQ5NTkxM30seyJsdCI6NTAwODA3NTU0LCJsbiI6ODI0OTkwODR9LHsibHQiOjUwMDgwODM5OCwibG4iOjgyNTAyNDAzfSx7Imx0Ijo1MDA4MDkyNzgsImxuIjo4MjUwNTg2NX0seyJsdCI6NTAwODE0MTU1LCJsbiI6ODI1MjQ0MTd9LHsibHQiOjUwMDgxNzIxNywibG4iOjgyNTM1NjY1fSx7Imx0Ijo1MDA4MTg0ODYsImxuIjo4MjU0MDQzNH0seyJsdCI6NTAwODE5MDkzLCJsbiI6ODI1NDI3MTV9LHsibHQiOjUwMDgxOTYwNSwibG4iOjgyNTQ1MTI5fSx7Imx0Ijo1MDA4MjAyMDQsImxuIjo4MjU0ODI3OH0seyJsdCI6NTAwODIxNTU2LCJsbiI6ODI1NTYwODl9LHsibHQiOjUwMDgyMTk1MSwibG4iOjgyNTU4NTU0fSx7Imx0Ijo1MDA4MjI1NDcsImxuIjo4MjU2MjQzMH0seyJsdCI6NTAwODI1NTc1LCJsbiI6ODI1Nzk1Nzh9LHsibHQiOjUwMDgyNjcyNSwibG4iOjgyNTg1Mzc5fSx7Imx0Ijo1MDA4MjY5MzMsImxuIjo4MjU4NjA3Mn0seyJsdCI6NTAwODI4OTE4LCJsbiI6ODI1OTM5OTR9LHsibHQiOjUwMDgyOTkwNSwibG4iOjgyNTk3OTExfSx7Imx0Ijo1MDA4MzA1ODMsImxuIjo4MjYwMDUxOH0seyJsdCI6NTAwODM0MjE1LCJsbiI6ODI2MTQ3MTR9LHsibHQiOjUwMDgzNDIxNCwibG4iOjgyNjE0NzI1fSx7Imx0Ijo1MDA4MzY2MDQsImxuIjo4MjYyNDU3OH0seyJsdCI6NTAwODM5NjUzLCJsbiI6ODI2MzcxNTZ9LHsibHQiOjUwMDg0MDY1MywibG4iOjgyNjQxMjc4fSx7Imx0Ijo1MDA4NDM3ODksImxuIjo4MjY1MzUzNX0seyJsdCI6NTAwODQ1MTAxLCJsbiI6ODI2NjY1ODJ9LHsibHQiOjUwMDg0NTUxNywibG4iOjgyNjc3MTMxfSx7Imx0Ijo1MDA4NDU1OTAsImxuIjo4MjY3ODk3OX0seyJsdCI6NTAwODQ1Njc2LCJsbiI6ODI2ODAzMjJ9LHsibHQiOjUwMDg0NTc5MCwibG4iOjgyNjgxMjczfSx7Imx0Ijo1MDA4NDU5MjUsImxuIjo4MjY4NDA5OH0seyJsdCI6NTAwODQ2MzQ1LCJsbiI6ODI2OTI5MTF9LHsibHQiOjUwMDg0Njk4NCwibG4iOjgyNjk5OTYzfSx7Imx0Ijo1MDA4NDY5NDMsImxuIjo4MjcwMDE5Nn0seyJsdCI6NTAwODQ4MTg0LCJsbiI6ODI3MDk4ODN9LHsibHQiOjUwMDg0OTQ4MSwibG4iOjgyNzE3Nzc4fSx7Imx0Ijo1MDA4NTAwMjIsImxuIjo4MjcyMTI5NH0seyJsdCI6NTAwODUxNDIwLCJsbiI6ODI3MzAzODZ9LHsibHQiOjUwMDg1MTgzNCwibG4iOjgyNzMyODQ1fSx7Imx0Ijo1MDA4NTI1MDMsImxuIjo4MjczNzEyOX0seyJsdCI6NTAwODUzNTMyLCJsbiI6ODI3NDMwMzB9LHsibHQiOjUwMDg1Mzk4MCwibG4iOjgyNzQ5NTUzfSx7Imx0Ijo1MDA4NTI5NDcsImxuIjo4Mjc1ODIxNn0seyJsdCI6NTAwODUwODQ2LCJsbiI6ODI3NjU0MTB9LHsibHQiOjUwMDg1MDU3MywibG4iOjgyNzY2MTYzfSx7Imx0Ijo1MDA4NTAyNDAsImxuIjo4Mjc2NzA5MX0seyJsdCI6NTAwODU1MjQ5LCJsbiI6ODI3Njk4NjN9LHsibHQiOjUwMDg2NTU0OSwibG4iOjgyNzc2ODA3fSx7Imx0Ijo1MDA4NzU2NTIsImxuIjo4Mjc4MjU0NH0seyJsdCI6NTAwODgwMTA4LCJsbiI6ODI3ODUzODd9LHsibHQiOjUwMDg5MjQyOCwibG4iOjgyNzkxODY0fSx7Imx0Ijo1MDA5MDA2OTUsImxuIjo4Mjc5NTc5NX0seyJsdCI6NTAwOTA4NDk4LCJsbiI6ODI3OTc3NjN9LHsibHQiOjUwMDkxNjY3NSwibG4iOjgyNzk3NjQwfSx7Imx0Ijo1MDA5MjE1ODEsImxuIjo4Mjc5NjMxOX0seyJsdCI6NTAwOTI2MzQyLCJsbiI6ODI3OTQ1MTl9LHsibHQiOjUwMDkyNzY2OCwibG4iOjgyNzk0MDExfSx7Imx0Ijo1MDA5MzY5MTEsImxuIjo4Mjc4OTg4Mn0seyJsdCI6NTAwOTQ5MjI3LCJsbiI6ODI3ODQwOTZ9LHsibHQiOjUwMDk1MTM5OCwibG4iOjgyNzgzMTU5fSx7Imx0Ijo1MDA5NTk2MjUsImxuIjo4Mjc4MzIzMX0seyJsdCI6NTAwOTYxNDMzLCJsbiI6ODI3ODM2OTZ9LHsibHQiOjUwMDk2NzY0NywibG4iOjgyNzgzODY2fSx7Imx0Ijo1MDA5NzAyNjQsImxuIjo4Mjc4Mzg1MH0seyJsdCI6NTAwOTc4Mzk4LCJsbiI6ODI3ODM5ODd9LHsibHQiOjUwMDk4MjM3NiwibG4iOjgyNzg0MTkwfSx7Imx0Ijo1MDEwMDA2OTksImxuIjo4Mjc4NTE4MH0seyJsdCI6NTAxMDE4NzE2LCJsbiI6ODI3ODU4MjZ9LHsibHQiOjUwMTAyMzQxMCwibG4iOjgyNzg1Mzc4fSx7Imx0Ijo1MDEwMzY1NzUsImxuIjo4Mjc4MzQ4M30seyJsdCI6NTAxMDM5NjA4LCJsbiI6ODI3ODMwOTR9LHsibHQiOjUwMTA0MjU5MiwibG4iOjgyNzgzMDU4fSx7Imx0Ijo1MDEwNjAwMjUsImxuIjo4Mjc4Mzg2MH0seyJsdCI6NTAxMDYzMjA5LCJsbiI6ODI3ODQ1MTN9LHsibHQiOjUwMTA2NDk5MywibG4iOjgyNzg1MDk1fSx7Imx0Ijo1MDEwNzU2NzAsImxuIjo4Mjc5MDk2OX0seyJsdCI6NTAxMDc2MDI2LCJsbiI6ODI3OTEyMDh9LHsibHQiOjUwMTA4MjkwNywibG4iOjgyNzk2NDc4fSx7Imx0Ijo1MDEwODQ1MDQsImxuIjo4Mjc5Nzc4OH0seyJsdCI6NTAxMDg2NTIzLCJsbiI6ODI4MDAwNDN9LHsibHQiOjUwMTA4ODkxMSwibG4iOjgyODAyNzAzfSx7Imx0Ijo1MDEwOTE3NzYsImxuIjo4MjgwNjk1OH0seyJsdCI6NTAxMDkyOTU4LCJsbiI6ODI4MDg2MTJ9LHsibHQiOjUwMTA5NTczNiwibG4iOjgyODExMjcyfSx7Imx0Ijo1MDEwOTY3ODIsImxuIjo4MjgxMjE2M30seyJsdCI6NTAxMDk3MzE5LCJsbiI6ODI4MTI2MDN9LHsibHQiOjUwMTEwMjM1MCwibG4iOjgyODE3MDgwfSx7Imx0Ijo1MDExMDMxMjgsImxuIjo4MjgxNzY5MX0seyJsdCI6NTAxMTA0MTYzLCJsbiI6ODI4MTg1MDF9LHsibHQiOjUwMTEwNTE3MCwibG4iOjgyODE5Mzk1fSx7Imx0Ijo1MDExMTExNDIsImxuIjo4MjgyNDY5NH0seyJsdCI6NTAxMTM1NDcxLCJsbiI6ODI4NDYwMjl9LHsibHQiOjUwMTE1NzA1NiwibG4iOjgyODY2MDY5fSx7Imx0Ijo1MDExNjM2NzIsImxuIjo4Mjg3MTM0NX0seyJsdCI6NTAxMTY0NDE3LCJsbiI6ODI4NzE5NjN9LHsibHQiOjUwMTE3ODI4MCwibG4iOjgyODgyNDYyfSx7Imx0Ijo1MDExOTMxMDAsImxuIjo4Mjg5MDMwMX0seyJsdCI6NTAxMjI5Nzc5LCJsbiI6ODI5MDQ1NDd9LHsibHQiOjUwMTIzMDczNCwibG4iOjgyOTA0ODU2fSx7Imx0Ijo1MDEyNjI3MjIsImxuIjo4MjkyODM5NH0seyJsdCI6NTAxMjc0NDE4LCJsbiI6ODI5MzM2OTB9LHsibHQiOjUwMTI4MDE5NiwibG4iOjgyOTMzOTU5fSx7Imx0Ijo1MDEyODU1NzgsImxuIjo4MjkzMzMwNn0seyJsdCI6NTAxMjk1Nzk2LCJsbiI6ODI5MzA0ODZ9LHsibHQiOjUwMTI5OTkzOCwibG4iOjgyOTI4OTc1fSx7Imx0Ijo1MDEzMDE2MDksImxuIjo4MjkyODM2NX0seyJsdCI6NTAxMzA3NjQ4LCJsbiI6ODI5MjYwMTh9LHsibHQiOjUwMTMxODEyNywibG4iOjgyOTIxNDEzfSx7Imx0Ijo1MDEzMjUyMjQsImxuIjo4MjkxOTQzOX0seyJsdCI6NTAxMzM1ODc0LCJsbiI6ODI5MTYzNDh9LHsibHQiOjUwMTM0NjQwNiwibG4iOjgyOTE0ODkwfSx7Imx0Ijo1MDEzNjA3NjUsImxuIjo4MjkxNTA1Mn0seyJsdCI6NTAxMzcyNDI4LCJsbiI6ODI5MTc5NTN9LHsibHQiOjUwMTM3ODUyMiwibG4iOjgyOTIwNjAxfSx7Imx0Ijo1MDEzODQ0OTUsImxuIjo4MjkyNDQ5NH0seyJsdCI6NTAxMzg4NjcwLCJsbiI6ODI5Mjg3NDV9LHsibHQiOjUwMTM5MTgxMiwibG4iOjgyOTMzNTYyfSx7Imx0Ijo1MDEzOTU3MDksImxuIjo4Mjk0MzgxNH0seyJsdCI6NTAxMzk2OTgwLCJsbiI6ODI5NDk5NDZ9LHsibHQiOjUwMTM5NzQzOCwibG4iOjgyOTU2MTU3fSx7Imx0Ijo1MDEzOTczNTksImxuIjo4Mjk2MjAwMn0seyJsdCI6NTAxMzk2ODA0LCJsbiI6ODI5Njc0Nzl9LHsibHQiOjUwMTM5NjQxNCwibG4iOjgyOTY5OTgwfSx7Imx0Ijo1MDEzOTA3OTIsImxuIjo4Mjk5NDc5Mn0seyJsdCI6NTAxMzg5NjYxLCJsbiI6ODMwMDE0Njl9LHsibHQiOjUwMTM4OTQzNiwibG4iOjgzMDEwMTgyfSx7Imx0Ijo1MDEzOTI2MjAsImxuIjo4MzAzMjEzM30seyJsdCI6NTAxMzkzMTEzLCJsbiI6ODMwMzg3MDJ9LHsibHQiOjUwMTM5MzM2NSwibG4iOjgzMDQ0MDEzfSx7Imx0Ijo1MDEzOTMwNzAsImxuIjo4MzA1MzA3OH0seyJsdCI6NTAxMzkyMzUzLCJsbiI6ODMwNTk1NzR9LHsibHQiOjUwMTM5MTcwOCwibG4iOjgzMDY0NDY1fSx7Imx0Ijo1MDEzODk2MzUsImxuIjo4MzA3NzIwNX0seyJsdCI6NTAxMzg4NjMxLCJsbiI6ODMwODM3NTV9LHsibHQiOjUwMTM4Njk0NywibG4iOjgzMDk4MTMwfSx7Imx0Ijo1MDEzODU1ODUsImxuIjo4MzExMjc2OX0seyJsdCI6NTAxMzg0MzE0LCJsbiI6ODMxMjYwMDd9LHsibHQiOjUwMTM4NDI2OCwibG4iOjgzMTI2NDQ5fSx7Imx0Ijo1MDEzODIxMTksImxuIjo4MzE1MDY1N30seyJsdCI6NTAxMzgyMTU5LCJsbiI6ODMxNjE2NjF9LHsibHQiOjUwMTM4MzQ4MiwibG4iOjgzMTY5NjI0fSx7Imx0Ijo1MDEzODQ2MTksImxuIjo4MzE3NjAwM30seyJsdCI6NTAxMzkyMDk4LCJsbiI6ODMyMTIwODF9LHsibHQiOjUwMTQwMDIxMywibG4iOjgzMjQ4NTIyfSx7Imx0Ijo1MDE0MDE4MTcsImxuIjo4MzI1NDk4N30seyJsdCI6NTAxNDAzMTA5LCJsbiI6ODMyNTg5NDJ9LHsibHQiOjUwMTQwNTUwOSwibG4iOjgzMjY0MDQ3fSx7Imx0Ijo1MDE0MDc1MTEsImxuIjo4MzI2NzQwNH0seyJsdCI6NTAxNDE5ODU4LCJsbiI6ODMyODExMDV9LHsibHQiOjUwMTQyMDk5NywibG4iOjgzMjgzMTQ4fSx7Imx0Ijo1MDE0MjM4MTYsImxuIjo4MzI4ODI1NX0seyJsdCI6NTAxNDI2NTA5LCJsbiI6ODMyOTM5NjF9LHsibHQiOjUwMTQyODMzNiwibG4iOjgzMjk0NjEwfSx7Imx0Ijo1MDE0MzE2NDMsImxuIjo4MzI5NDAwM30seyJsdCI6NTAxNDM2NTM1LCJsbiI6ODMyODc1NTl9LHsibHQiOjUwMTQ0MDcwMiwibG4iOjgzMjgxOTAyfSx7Imx0Ijo1MDE0NDQxMDUsImxuIjo4MzI3OTA5M30seyJsdCI6NTAxNDQ4MDg0LCJsbiI6ODMyNzc2NDJ9LHsibHQiOjUwMTQ1MzI4NywibG4iOjgzMjc3MzkyfSx7Imx0Ijo1MDE0NTg2ODAsImxuIjo4MzI3NzM4NX0seyJsdCI6NTAxNDYyMDEyLCJsbiI6ODMyNzY5OTN9LHsibHQiOjUwMTQ2NjA1NywibG4iOjgzMjc2MTg3fV0sIm1pc2MiOnsiZGlzdGFuY2UiOjEyMTM0fX0="
            };
    }
});
