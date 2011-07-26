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
			alert(jqXHR.responseText);
		},
		error: function( jqXHR, textStatus, errorThrown ) {
			alert(textStatus + ": " + errorThrown);
		}
	});
};
