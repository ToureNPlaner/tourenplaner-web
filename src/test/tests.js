
// documentation on writing tests here: http://docs.jquery.com/QUnit
// example tests: https://github.com/jquery/qunit/blob/master/test/same.js

/**
 * This is a small hack to easily test multiple async functions inside
 * one test function.
 * It is used instead of stop() and start().
 *
 * Usage:   Where you would normally use stop() use stop_until_expected()
 *          and give the function the number of tests until start() should
 *          be called.
 *          In each async callback function call do_start() once.
 */
var _expected_returns = 0, _current_returns = 0;

function stop_until_expected(num) {
    _expected_returns = num;
    _current_returns = 0;
    stop();
}

function do_start() {
    _current_returns += 1;
    if (_current_returns == _expected_returns)
        start();
}

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

test("api.send", 5, function() {
    ok(!api.send(), "Empty function call");
    ok(!api.send({}), "Empty object");

    ok(!api.send({request: {}, callback: function() { }}), "No suffix specified");
    ok(!api.send({suffix: "", request: {}, callback: function() { }}), "Empty suffix");
    ok(!api.send({suffix: "authuser", request: {}}), "Empty callback");
})

test("/info", 4, function() {
    var tmpApi = new Api({
        server: null
    });

    stop_until_expected(1);
    var ret = tmpApi.serverInformation({
        callback: function(json, success) {
            same(success, true, 'Got some info');
            same(json.servertype, 'public', 'Servertype was determined');
            same(json.algorithms[0].pointconstraints[0].type, 'meter', 'Algorithm constraints are ok');
            same(tmpApi.get('port'), 8081, "SSL information read");
            do_start();
        }
    });
    //TODO: Add more tests
});

test("/authuser", 5, function() {
    ok(!api.authUser(), 'Empy function call');
    ok(!api.authUser({}), 'Empty object');

    stop_until_expected(3);
    api.authUser({
        email: 'asd@asd.de',
        password: 'asd',
        callback: function(text, success) {
            same(success, true, 'Login working for asd@asd.de:asd');
            do_start();
        }
    });

    api.authUser({
        email: 'bsd@asd.de',
        password: 'asd',
        callback: function(text, success) {
            same(success, false, "Login not working for bsd@asd.de:asd");
            do_start();
        }
    });

    api.authUser({
        email: 'asd@asd.de',
        password: 'bsd',
        callback: function(text, success) {
            same(success, false, 'Login not working for asd@asd.de:bsd');
            do_start();
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
    }, test_user = {};

    stop_until_expected(2);
    api.registerUser({
        userObject: user,
        callback: function(text, success) {
            same(success, true, "Registration successful");
            do_start();
        }
    });
    testuser = _.extend({}, user);
    testuser.email = "";
    api.registerUser({
        userObject: testuser,
        callback: function(text, success) {
            same(success, false, "Empty email address");
            do_start();
        }
    });
});

test("/getuser", 2, function() {
    api.authUser({
        email: 'asd@asd.de',
        password: 'asd',
        callback: function(text, success) {
        }
    });
    
    stop_until_expected(2);
    api.getUser({
        callback: function(json, success){
            same(json.email, 'asd@asd.de', 'email checked');
            do_start();
        }
    });
    api.getUser({
        id: 42,
        callback: function(json, success){
            same(json.email, 'qwe@ewq.de', 'email checked');
            do_start();
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
    
    stop_until_expected(2);
    api.updateUser({userObject: user,
                    callback: function(json, success){
                        same(json.firstname, "Peter", "Firstname updated");
                        do_start();
                    } 
    });
    api.updateUser({userObject: user,
                    callback: function(json, success){
                        same(json.firstname, "Peter", "Firstname updated");
                        do_start();
                    } 
    });
});

test("/listrequests", 6, function (){
    api.authUser({
        email:'asd@asd.de',
        password: 'asd',
        callback: function(text, success){
        }
    });
    
    ok(!api.listRequests(), 'empty call');
    ok(!api.listRequests({limit: 10}), 'missing offset');
    ok(!api.listRequests({offset: 10}), 'missing limit');
    ok(!api.listRequests({limit: 2, offset: -1}), 'offset < 0')
    
    stop_until_expected(2);
    api.listRequests({limit: 2,
                  offset: 3,
                  callback: function(json, success){
                      same(success, true, "own request list loaded");
                      do_start();
                  }
    });
    
    api.listRequests({id:1024,
                      limit: 1,
                      offset: 1032,
                  callback: function(json, success){
                      same(success, true, "request list of id 1024 loaded");
                      do_start();
                  }
    });
});

test("/listusers", 5, function (){
    api.authUser({
        email:'asd@asd.de',
        password: 'asd',
        callback: function(text, success){
        }
    });
    
    ok(!api.listUsers(), 'empty call');
    ok(!api.listUsers({limit: 10}), 'missing offset');
    ok(!api.listUsers({offset: 10}), 'missing limit');
    ok(!api.listUsers({limit: 2, offset: -10}), 'offset < 0')
    
    stop_until_expected(1);
    api.listUsers({limit: 1,
                  offset: 3,
                  callback: function(json, success){
                      same(success, true, "own request list loaded");
                      do_start();
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
    
    stop_until_expected(1);
    api.deleteUser({id: 94,
                  callback: function(json, success){
                      same(success, true, "user deleted");
                      do_start();
                  }
    });
});

test("/alg", 5, function (){
    var request = {
        version: 1,
        points: [
            {lt: -9.14323, ln: 8.43},
            {lt: -54.3, ln: 1.23}
        ],
        constraints: {t: 100}
    }
    
    ok(!api.alg(), 'empty call');
    ok(!api.alg({callback: function(){ }, alg: "sp"}), 'missing request');
    ok(!api.alg({request: request, callback: function(){ }}), 'no alg specified');
    

    stop_until_expected(2);
    api.alg({request: request,
            alg: "sp",
              callback: function(json, success){
                  same(success, true, "route calculated without auth");
                  do_start();
              }
    });
    api.authUser({
        email:'asd@asd.de',
        password: 'asd',
        callback: function(text, success){
        }
    });
    api.alg({request: request,
            alg: "sp",
              callback: function(json, success){
                  same(success, true, "route calculated with auth");
                  do_start();
              }
    });
});
