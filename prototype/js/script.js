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
});
