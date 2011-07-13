/* Author:

*/

$(function() {
    $('header .settings-icon a').click(function() {
        var elem = $(this).parent();
        elem.toggleClass('settings-icon-overlay settings-icon-no-overlay');
        elem.next().toggle();
    });
});
