/* Author:

*/

var data_style = "";

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
    
});
