/* Author:

*/

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
    
    $('#main #data .minimize a').click(function() {        
        $('#main #data #content').toggle('blind');
        $('#main #data .maximize').show();
        $(this).parent().hide();
    });
    
    $('#main #data .maximize a').click(function() {
        $('#main #data #content').toggle('blind');
        $('#main #data .minimize').show();
        $(this).parent().hide();
    });
});
