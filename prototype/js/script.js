/* Author:

*/

var data_style = "";
var user = { username: "", password: "" };
var authBase64 = "";

/** Initialize all UI functions/buttons/dialogs/whatever */
$(function() {
    // Header settings dropdown
    $('header .settings-icon a').click(function() {
        var elem = $(this).parent();
        elem.toggleClass('settings-icon-overlay settings-icon-no-overlay');
        elem.next().toggle('blind');
    });

    // Resizable result area
    $('#main #sidebar').resizable({
        handles: 'e'
    });

    // update map size when resize sidebar
    var resizeUpdater = function(event, ui) {
    	$("#main #map").css('left', ui.size.width);
    	$("#main #map").css('width', "100%");
    	$("#main #map").css('height', "100%");
    	mapObject.refresh();
    };
    $("#main #sidebar").bind("resize", resizeUpdater);
    $("#main #sidebar").bind("resizestop", resizeUpdater);

    $('#main #data').resizable({
       handles: 'w,nw,n'
    });

    $('#main #data #minmax a').click(function() {
        $('#main #data #content').toggle();
        var parent = $('#main #data');
        parent.toggleClass('minimized');
        if ($(this).html() == '_') {
            $(this).html('Daten');

            data_style = parent.attr('style');
            parent.attr('style', '');
        } else {
            $(this).html('_');
            parent.attr('style', data_style);
        }
    });

    $('header .login a').click(function() {
        $('#login').dialog({
            modal: true,
            resizable: false,
            buttons: {
                "Login" : function() {
                    var valid = true;
                    var username = $('#login form #username').val();
                    var password = $('#login form #password').val();

                    if (username.length == 0) {
                        valid = false;
                        $('#login form #username').addClass('ui-state-error')
                    }
                    if (password.length == 0) {
                        valid = false;
                        $('#login form #password').addClass('ui-state-error');
                    }
                    
		    // user: FooUser
		    // pass: FooPassword
		    authBase64 = base64_encode(username + ":" + password);
		    if(authBase64 != 'Rm9vVXNlcjpGb29QYXNzd29yZA=='){
        		valid = false;
		    }

                    if (valid) {
                        user = { username: username, password: password };
                        log(user);
                        $(this).dialog('close');
			$('.login').html(user.username);
                    } else {
                        $('.validate', this).show();
                    }
                },
                "Cancel" : function() {
                    $(this).dialog('close');
                }
            },
            close: function() {
                $('input', this).val('').removeClass('ui-state-error');
                $('.validate', this).hide();
            }
        });
    });
});

$(document).ready(function() {
    $("button").button();
    $("button").click(function(){
	var start = $('#main #sidebar form #start').val();
	var target = $('#main #sidebar form #target').val();
	request(start, target);
    });
});

function request(start, target){
	var requestString = '{"Request" : [[' + start + '], [' + target + ']]}';
	var authHeader = "'Basic " + authBase64 + "'";
//	jQuery.support.cors = true; // force cross-site scripting (as of jQuery 1.5)

	// method performs an asyncronous HTTP request.
	// use success function and data.slice to handle received data
	// returns a jqXHR object
	var jqxhr = $.ajax({
		url: 'http://localhost:8081/sp',
		cache: false,
		type: 'POST',
//		crossDomain: true,
		accepts: 'json',
		headers: {'Authorization' : authHeader},
		data: requestString,
		success: function( data, textStatus, jqXHR ) {
			// Get responding route with: "jqXHR.responseText"
			//(alert(jqXHR.responseText);
			mapObject.drawRoute("[9.219390,48.680170,0.000000],[9.219080,48.680060,0.000000],[9.219080,48.680060,0.000000],[9.219190,48.679820,0.000000],[9.219700,48.679140,0.000000],[9.219810,48.678840,0.000000],[9.219810,48.678700,0.000000],[9.219810,48.678700,0.000000],[9.218010,48.678460,0.000000],[9.216390,48.678180,0.000000],[9.216210,48.678110,0.000000],[9.216210,48.678110,0.000000],[9.216430,48.677350,0.000000],[9.217050,48.676210,0.000000],[9.217050,48.676210,0.000000],[9.216960,48.676060,0.000000],[9.216670,48.675870,0.000000],[9.216390,48.674940,0.000000],[9.216180,48.674640,0.000000],[9.215950,48.674430,0.000000],[9.215380,48.674090,0.000000],[9.214870,48.673720,0.000000],[9.214500,48.673290,0.000000],[9.214130,48.672400,0.000000],[9.213890,48.671620,0.000000],[9.213600,48.671060,0.000000],[9.213360,48.670800,0.000000],[9.212360,48.669990,0.000000],[9.212360,48.669990,0.000000],[9.212200,48.669980,0.000000],[9.212210,48.669870,0.000000],[9.212280,48.669850,0.000000],[9.212390,48.669890,0.000000],[9.213250,48.669290,0.000000],[9.213250,48.669290,0.000000],[9.212990,48.669190,0.000000],[9.212910,48.669190,0.000000],[9.212370,48.669320,0.000000],[9.212190,48.669320,0.000000],[9.211310,48.669000,0.000000],[9.211160,48.668880,0.000000],[9.211160,48.668880,0.000000],[9.211040,48.668720,0.000000],[9.211180,48.668140,0.000000],[9.211180,48.667870,0.000000]");
	
		},
		error: function( jqXHR, textStatus, errorThrown ) {
			alert(textStatus + ": " + errorThrown);
		}
	});
};
