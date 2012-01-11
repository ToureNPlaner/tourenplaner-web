
// documentation on writing tests here: http://docs.jquery.com/QUnit
// example tests: https://github.com/jquery/qunit/blob/master/test/same.js

/*******************************
 * TESTS
 ******************************/

// these tests things from plugins.js
module("plugins.js");
test("Log function/Modernizr", function(){
    ok(!!window.log, "log function present");

    var history = log.history && log.history.length || 0;
    log("logging from the test suite.")
    equals(log.history.length - history, 1, "log history keeps track")

    ok(!!window.Modernizr, "Modernizr global is present")
});

module("api.js");

test("api", function() {
    var test = new Api();
    same(test.get('server'), 'localhost', "Defaults");

    test = new Api({
        server: 'asd.de'
    });
    same(test.get('server'), 'asd.de', "Changing defaults through constructor");

    test.set({server: 'localhost'});
    same(test.get('server'), 'localhost', "Api.set");
});

var api = new Api({
    server: null,
    authRequired: true
});

test("api.send", 6, function() {
    ok(!api.send(), "Empty function call");
    ok(!api.send({}), "Empty object");

    ok(!api.send({request: {}, callback: function() { }}), "No suffix specified");
    ok(!api.send({suffix: "", request: {}, callback: function() { }}), "Empty suffix");
    ok(api.send({suffix: "authuser", request: {}}), "Empty callback");
    ok(api.send({suffix: "authuser", request: {}, callback: function() {}}), "Null callback");
});

test("/info", 5, function() {
    var tmpApi = new Api({
        server: null
    });

    stop();
    var ret = tmpApi.serverInformation({
        callback: function(json, success) {
            same(success, true, 'Got some info');
            same(json.servertype, 'private', 'Servertype was determined. Is Private');
            same(json.algorithms[0].pointconstraints[0].type, 'meter', 'Algorithm constraints are ok');
            same(tmpApi.get('authRequired'), true, "SSL information read");
            same(tmpApi.get('port'), 1515, "SSL-Port information read");
            start();
        }
    });
});

test("/registeruser", 4, function() {
    ok(!api.registerUser(), 'Empty function call');
    ok(!api.registerUser({}), 'Empty object');

    var user = {
        email: "asd@asd.de",
        password: "asd",
        firstname: "asd",
        lastname: "asd",
        address: "asd"
    };

    stop(2);
    api.registerUser({
        userObject: user,
        callback: function(text, success) {
            same(success, true, "Registration successful");
            start();
        }
    });

    user.email = "";
    api.registerUser({
        userObject: user,
        callback: function(text, success) {
            same(success, false, "Empty email address");
            start();
        }
    });
});

test("/authuser", 6, function() {
    ok(!api.authUser(), 'Empy function call');
    ok(!api.authUser({}), 'Empty object');

    stop(3);
    api.authUser({
        email: 'bsd@asd.de',
        password: 'asd',
        callback: function(text, success) {
            same(success, false, "Login not working for bsd@asd.de:asd");
            start();
        }
    });

    api.authUser({
        email: 'asd@asd.de',
        password: 'bsd',
        callback: function(text, success) {
            same(success, false, 'Login not working for asd@asd.de:bsd');
            start();
        }
    });
    
    api.authUser({
        email: 'asd@asd.de',
        password: 'asd',
        callback: function(text, success) {
            same(success, true, 'Login working for asd@asd.de:asd');
            same(api.get('authAsBase64'), 'YXNkQGFzZC5kZTphc2Q=', 'Base64String');
            start();
        }
    });
});

test("/getuser", 2, function() {
    api.authUser({
        email: 'asd@asd.de',
        password: 'asd',
        callback: null
    });
    
    stop(2);
    api.getUser({
        callback: function(json, success){
            same(json.email, 'asd@asd.de', 'email checked');
            start();
        }
    });
    api.getUser({
        id: 42,
        callback: function(json, success){
            same(json.email, 'qwe@ewq.de', 'email checked');
            start();
        }
    });
});

test("/updateUser", 4, function(){
    api.authUser({
        email: 'asd@asd.de',
        password: 'asd',
        callback: function(text, success) {
        }
    });
    ok(!api.updateUser(), 'empty call');
    ok(!api.updateUser({karl: "test"}), 'missing user object');
    
    var user = {
        email: "asd@asd.de",
        password: "asd",
        firstname: "Peter",
        lastname: "Lustig",
        address: "asd"
    };
    
    stop(2);
    api.updateUser({userObject: user,
                    callback: function(json, success){
                        same(json.firstname, "Peter", "Firstname updated");
                        start();
                    } 
    });
    api.updateUser({userObject: user,
                    callback: function(json, success){
                        same(json.firstname, "Peter", "Firstname updated");
                        start();
                    } 
    });
});

test("/listrequests", 9, function (){
    api.authUser({
        email:'asd@asd.de',
        password: 'asd',
        callback: function(text, success){
        }
    });
    
    ok(!api.listRequests(), 'empty call');
    ok(!api.listRequests({limit: 10}), 'missing offset');
    ok(!api.listRequests({offset: 10}), 'missing limit');
    ok(!api.listUsers({limit: 2, offset: -10}), 'offset < 0');
    ok(!api.listUsers({limit: -2, offset: 10}), 'limit < 0');
    ok(!api.listUsers({limit: "e", offset: 10}), 'limit NaN');
    ok(!api.listUsers({limit: 2, offset: "w"}), 'offset NaN');
    
    stop(2);
    api.listRequests({limit: 2,
                  offset: 3,
                  callback: function(json, success){
                      same(success, true, "own request list loaded");
                      start();
                  }
    });
    
    api.listRequests({id:1024,
                  limit: 1,
                  offset: 1032,
                  callback: function(json, success){
                      same(success, true, "request list of id 1024 loaded");
                      start();
                  }
    });
});

test("/listusers", 8, function (){
    api.authUser({
        email:'asd@asd.de',
        password: 'asd',
        callback: function(text, success){
        }
    });
    
    ok(!api.listUsers(), 'empty call');
    ok(!api.listUsers({limit: 10}), 'missing offset');
    ok(!api.listUsers({offset: 10}), 'missing limit');
    ok(!api.listUsers({limit: 2, offset: -10}), 'offset < 0');
    ok(!api.listUsers({limit: -2, offset: 10}), 'limit < 0');
    ok(!api.listUsers({limit: "e", offset: 10}), 'limit NaN');
    ok(!api.listUsers({limit: 2, offset: "w"}), 'offset NaN');
    
    stop();
    api.listUsers({limit: 1,
                  offset: 3,
                  callback: function(json, success){
                      same(success, true, "own request list loaded");
                      start();
                  }
    });
});

test("/deleteuser", 4, function (){
    api.authUser({
        email:'asd@asd.de',
        password: 'asd',
        callback: function(text, success){
        }
    });
    
    ok(!api.deleteUser(), 'empty call');
    ok(!api.deleteUser({callback: function(){ }}), 'missing id');
    ok(!api.deleteUser({id: "r94",callback: function(){ }}), 'id ("r94") is not a number');
    
    stop();
    api.deleteUser({id: 94,
                  callback: function(json, success){
                      same(success, true, "user deleted");
                      start();
                  }
    });
});

test("/alg", 8, function (){
    var request = {
        version: 1,
        points: [
            {lt: -9.14323, ln: 8.43},
            {lt: -54.3, ln: 1.23}
        ],
        constraints: {t: 100}
    }
    var requestMissPoints = {
        version: 1,
        constraints: {t: 100}
    }
    
    ok(!api.alg(), 'empty call');
    ok(!api.alg({callback: function(){ }, alg: "sp"}), 'missing request');
    ok(!api.alg({request: request, callback: function(){ }}), 'no alg specified');
    ok(!api.alg({version: request.version,constraints:request.constraints,alg: "sp",
    	callback: function(json, success){}}), "single parameters, missing points"); // 
    ok(!api.alg({request: requestMissPoints,alg: "sp",
    	callback: function(json, success){} }),'request parameter with missing points');

    stop(3);
    api.alg({version: request.version,
    		points: request.points,
    		constraints: request.constraints,
            alg: "sp",
              callback: function(json, success){
                  same(success, true, "route calculated with seperate parameter");
                  start();
              }
    });
    api.alg({request: request,
        alg: "sp",
           callback: function(json, success){
               same(success, true, "route calculated with request param");
               start();
           }
    });
    api.authUser({
        email:'asd@asd.de',
        password: 'asd',
        callback: null
    });
    api.alg({request: request,
            alg: "sp",
              callback: function(json, success){
                  same(success, true, "route calculated with auth");
                  start();
              }
    });
});

module("nominatim.js");

test("search", 3, function() {
    stop();

    window.nom = new Nominatim();
    nom.search("Stuttgart", function(success, msg) {
        same(success, true, "API call was successful");
        ok(msg.length > 0, "At least one object returned");
        var item;
        for (i in msg) {
            if (msg[i].class == "place") {
                item = msg[i];
                break;   
            }
        }
        same(item.address.city, "Stuttgart", "Addressdetails included");
        start();    
    });
});
