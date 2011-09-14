
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
    log.history = log.history || [];   // store logs to an array for reference
    log.history.push(arguments);
    if(this.console) {
        arguments.callee = arguments.callee.caller;
        var newarr = [].slice.call(arguments);
        (typeof console.log === 'object' ? log.apply.call(console.log, console, newarr) : console.log.apply(console, newarr));
    }
};

// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c}})((function(){try
{console.log();return window.console;}catch(err){return window.console={};}})());

// place any jQuery/helper plugins in here, instead of separate, slower script files.

/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
*  Modified to use native functions if available by Philipp Gildein
*
**/
 
var Base64 = {
 
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
	// public method for encoding
	encode : function (input) {
        if (typeof btoa === 'function') {
            return btoa(input);
        } else {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
     
            input = Base64._utf8_encode(input);
     
            while (i < input.length) {
     
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
     
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
     
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
     
                output = output +
                Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) +
                Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);
     
            }
     
            return output;
        }
	},
 
	// public method for decoding
	decode : function (input) {
        if (typeof atob === 'function') {
            return atob(input);
        } else {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
     
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
     
            while (i < input.length) {     
                enc1 = Base64._keyStr.indexOf(input.charAt(i++));
                enc2 = Base64._keyStr.indexOf(input.charAt(i++));
                enc3 = Base64._keyStr.indexOf(input.charAt(i++));
                enc4 = Base64._keyStr.indexOf(input.charAt(i++));
     
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
     
                output = output + String.fromCharCode(chr1);
     
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
     
            }
     
            output = Base64._utf8_decode(output);
     
            return output;
        }
	},
 
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	},
 
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = 0, c1 = 0, c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
 
		return string;
	}
 
}

/**
* jQuery Cookie plugin
*
* Copyright (c) 2010 Klaus Hartl (stilbuero.de)
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
*
*/
jQuery.cookie = function (key, value, options) {

    // key and at least value given, set cookie...
    if (arguments.length > 1 && String(value) !== "[object Object]") {
        options = jQuery.extend({}, options);

        if (value === null || value === undefined) {
            options.expires = -1;
        }

        if (typeof options.expires === 'number') {
            var days = options.expires, t = options.expires = new Date();
            t.setDate(t.getDate() + days);
        }

        value = String(value);

        return (document.cookie = [
            encodeURIComponent(key), '=',
            options.raw ? value : encodeURIComponent(value),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
        ].join(''));
    }

    // key and possibly options given, get cookie...
    options = value || {};
    var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
};



// jQuery Context Menu Plugin
//
// Version 1.01
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
//
// More info: http://abeautifulsite.net/2008/09/jquery-context-menu-plugin/
//
// Terms of Use
//
// This plugin is dual-licensed under the GNU General Public License
//   and the MIT License and is copyright A Beautiful Site, LLC.
//
if(jQuery)( function() {
	$.extend($.fn, {
		
		contextMenu: function(o, callback) {
			// Defaults
						if( o.menu == undefined ) return false;
		 if( o.inSpeed == undefined ) o.inSpeed = 150;
		 if( o.outSpeed == undefined ) o.outSpeed = 75;
		 // 0 needs to be -1 for expected results (no fade)
		 if( o.inSpeed == 0 ) o.inSpeed = -1;
		 if( o.outSpeed == 0 ) o.outSpeed = -1;
		 // Loop each context menu
		 $(this).each( function() {
			 var el = $(this);
			 var offset = $(el).offset();
			 // Add contextMenu class
			 $('#' + o.menu).addClass('contextMenu');
			 // Simulate a true right click
			 $(this).mousedown( function(e) {
				 var evt = e;
				 evt.stopPropagation();
				 $(this).mouseup( function(e) {
					 e.stopPropagation();
					 var srcElement = $(this);
					 $(this).unbind('mouseup');
					 if( evt.button == 2 ) {
						 // Hide context menus that may be showing
						 							$(".contextMenu").hide();
													// Get this context menu
													var menu = $('#' + o.menu);
													
													if( $(el).hasClass('disabled') ) return false;
			      
			      // Detect mouse position
													var d = {}, x, y;
													if( self.innerHeight ) {
														d.pageYOffset = self.pageYOffset;
														d.pageXOffset = self.pageXOffset;
														d.innerHeight = self.innerHeight;
														d.innerWidth = self.innerWidth;
													} else if( document.documentElement &&
														document.documentElement.clientHeight ) {
														d.pageYOffset = document.documentElement.scrollTop;
													d.pageXOffset = document.documentElement.scrollLeft;
													d.innerHeight = document.documentElement.clientHeight;
													d.innerWidth = document.documentElement.clientWidth;
														} else if( document.body ) {
															d.pageYOffset = document.body.scrollTop;
															d.pageXOffset = document.body.scrollLeft;
															d.innerHeight = document.body.clientHeight;
															d.innerWidth = document.body.clientWidth;
														}
																					(e.pageX) ? x = e.pageX : x = e.clientX + d.scrollLeft;
																					(e.pageY) ? y = e.pageY : y = e.clientY + d.scrollTop;
																					
																					// Show the menu
																					$(document).unbind('click');
																					$(menu).css({ top: y, left: x }).fadeIn(o.inSpeed);
																					// Hover events
																					$(menu).find('A').mouseover( function() {
																						$(menu).find('LI.hover').removeClass('hover');
																						$(this).parent().addClass('hover');
																					}).mouseout( function() {
																						$(menu).find('LI.hover').removeClass('hover');
																					});
																						
																						// Keyboard
																						$(document).keypress( function(e) {
																							switch( e.keyCode ) {
																								case 38: // up
										if( $(menu).find('LI.hover').size() == 0 ) {
											$(menu).find('LI:last').addClass('hover');
										} else {
											$(menu).find('LI.hover').removeClass('hover').prevAll('LI:not(.disabled)').eq(0).addClass('hover');
											if( $(menu).find('LI.hover').size() == 0 ) $(menu).find('LI:last').addClass('hover');
										}
																			break;
																								case 40: // down
										if( $(menu).find('LI.hover').size() == 0 ) {
											$(menu).find('LI:first').addClass('hover');
										} else {
											$(menu).find('LI.hover').removeClass('hover').nextAll('LI:not(.disabled)').eq(0).addClass('hover');
											if( $(menu).find('LI.hover').size() == 0 ) $(menu).find('LI:first').addClass('hover');
										}
																			break;
																								case 13: // enter
										$(menu).find('LI.hover A').trigger('click');
										break;
																								case 27: // esc
										$(document).trigger('click');
										break
																							}
																						});
																						
																						// When items are selected
																						$('#' + o.menu).find('A').unbind('click');
																						$('#' + o.menu).find('LI:not(.disabled) A').click( function() {
																							$(document).unbind('click').unbind('keypress');
																							$(".contextMenu").hide();
																							// Callback
																							if( callback ) callback( $(this).attr('href').substr(1), $(srcElement), {x: x - offset.left, y: y - offset.top, docX: x, docY: y} );
																												  return false;
																						});
																						
																						// Hide bindings
																						setTimeout( function() { // Delay for Mozilla
																														$(document).click( function() {
																															$(document).unbind('click').unbind('keypress');
																															$(menu).fadeOut(o.outSpeed);
																															return false;
																														});
					 }, 0);
				 }
			 });
		 });

// Disable text selection
if( $.browser.mozilla ) {
	$('#' + o.menu).each( function() { $(this).css({ 'MozUserSelect' : 'none' }); });
	} else if( $.browser.msie ) {
		$('#' + o.menu).each( function() { $(this).bind('selectstart.disableTextSelect', function() { return false; }); });
	} else {
		$('#' + o.menu).each(function() { $(this).bind('mousedown.disableTextSelect', function() { return false; }); });
	}
					// Disable browser context menu (requires both selectors to work in IE/Safari + FF/Chrome)
									$(el).add($('UL.contextMenu')).bind('contextmenu', function() { return false; });
													
});
			return $(this);
		},
		
		// Disable context menu items on the fly
		disableContextMenuItems: function(o) {
			if( o == undefined ) {
				// Disable all
								$(this).find('LI').addClass('disabled');
												return( $(this) );
			}
						$(this).each( function() {
							if( o != undefined ) {
								var d = o.split(',');
						for( var i = 0; i < d.length; i++ ) {
							$(this).find('A[href="' + d[i] + '"]').parent().addClass('disabled');
													
						}
							}
						});
									return( $(this) );
		},
		
		// Enable context menu items on the fly
		enableContextMenuItems: function(o) {
			if( o == undefined ) {
				// Enable all
								$(this).find('LI.disabled').removeClass('disabled');
												return( $(this) );
			}
						$(this).each( function() {
							if( o != undefined ) {
								var d = o.split(',');
						for( var i = 0; i < d.length; i++ ) {
							$(this).find('A[href="' + d[i] + '"]').parent().removeClass('disabled');
													
						}
							}
						});
									return( $(this) );
		},
		
		// Disable context menu(s)
		disableContextMenu: function() {
			$(this).each( function() {
				$(this).addClass('disabled');
			});
			return( $(this) );
		},
		
		// Enable context menu(s)
		enableContextMenu: function() {
			$(this).each( function() {
				$(this).removeClass('disabled');
			});
			return( $(this) );
		},
		
		// Destroy context menu(s)
		destroyContextMenu: function() {
			// Destroy specified context menus
						$(this).each( function() {
							// Disable action
											$(this).unbind('mousedown').unbind('mouseup');
						});
									return( $(this) );
		}
				
	});
})(jQuery);