
// documentation on writing tests here: http://docs.jquery.com/QUnit
// example tests: https://github.com/jquery/qunit/blob/master/test/same.js

// these tests things from plugins.js
module("plugins.js");
test("Log function/Modernizr", function(){
    ok(!!window.log, "log function present");

    var history = log.history && log.history.length || 0;
    log("logging from the test suite.")
    equals(log.history.length - history, 1, "log history keeps track")

    ok(!!window.Modernizr, "Modernizr global is present")
});

api = new Api();
api.set({
    server: null,
    authRequired: true
});

module("api.js");
test("/info", function() {
    var ret = api.serverInformation();
    //TODO: Nothing to test yet
});

test("/authuser", 5, function() {
    ok(!api.authUser(), 'Empy function call');
    ok(!api.authUser({}), 'Empty object');

    stop();
    api.authUser({
        email: 'asd@asd.de',
        password: 'asd',
        callback: function(text, success) {
            same(success, true, 'Login working for asd@asd.de:asd');
        }
    });


    api.authUser({
        email: 'bsd@asd.de',
        password: 'asd',
        callback: function(text, success) {
            same(success, false, "Login not working for bsd@asd.de:asd");
        }
    });

    api.authUser({
        email: 'asd@asd.de',
        password: 'bsd',
        callback: function(text, success) {
            same(success, false, 'Login not working for asd@asd.de:bsd');
        }
    });

    setTimeout(function() {
        start();
    }, 1000);
});
