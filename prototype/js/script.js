/* Author:

*/

var data_style = "";
var user = { username: "", password: "" };

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

                    if (valid) {
                        user = { username: username, password: password };
                        log(user);
                        $(this).dialog('close');
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
