
// documentation on writing tests here: http://docs.jquery.com/QUnit
// example tests: https://github.com/jquery/qunit/blob/master/test/same.js

// below are some general tests but feel free to delete them.

window.testApi = new Api();

// these test things from plugins.js
test("Log function/Modernizr",function(){
  expect(3);
  ok( !!window.log, "log function present");

  var history = log.history && log.history.length || 0;
  log("logging from the test suite.")
  equals( log.history.length - history, 1, "log history keeps track" )

  ok( !!window.Modernizr, "Modernizr global is present")
});

test("Login function", function() {
  expect(3);
  
  ok( !! testApi.authUser('asd', 'asd'), "login working for asd:asd");
  ok( ! testApi.authUser('bsd', 'asd'), "login not working for bsd:asd");
  ok( ! testApi.authUser('asd', 'bsd'), "login not working for asd:bsd");
});
