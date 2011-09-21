
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
    ok(!api.send({suffix: "", reqData: {}, callback: function() { }}), "Empty suffix");

    ok(api.send({suffix: "authuser", callback: function() { }}), "Undefined reqData");
    ok(api.send({suffix: "authuser", reqData: {}, callback: null}), "Empty callback");
})

test("/info", function() {
    var tmpApi = new Api({
        server: null
    });

    //TODO: See what we can do here
    var ret = tmpApi.serverInformation();

    same(tmpApi.get('ssl'), true, "SSL information read");

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

test("/registeruser", 3, function() {
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
