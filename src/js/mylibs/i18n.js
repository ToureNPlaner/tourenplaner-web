var available_langs = ['en', 'de'];
var default_lang = 'en';

// Determine language from browser variable
var lang = navigator.language || navigator.browserLanguage;

if ($.inArray(lang, available_langs) === -1) {
    // Currently only the language is support (en instead of en-gb/en-us)
    if (lang.length > 2 && $.inArray(lang.substr(0, 2), available_langs) >= 0) {
        lang = lang.substring(0, 2);
    } else {
        lang = default_lang;
    }
}

var i18n = {};
if (lang !== default_lang) {
    $.ajaxSetup({async: false});
    $.ajax('js/lang/' + lang + '.js', {dataType: 'script'});
    $.ajaxSetup({async: true});
}

/**
 * Get the translated version of key. Can also be used as $._(key).
 *
 * @param {String} The string to be translated
 * @returns {String} The translated string
 */
function gettext(key) {
    if (i18n[key] && i18n[key].length > 0)
        return i18n[key];
    else
        return key;
}

$.extend({ '_': gettext });
