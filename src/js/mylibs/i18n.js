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

log('Loading language:', lang);
if (lang === default_lang) {
    var i18n = {};
} else {
    document.write('<script src="js/lang/' + lang + '.js"><\/script>');
}

/**
 * Get the translated version of key. Can also be used as $._(key).
 *
 * @param {String} The string to be translated
 * @returns {String} The translated string
 */
function gettext(key) {
    if (i18n[key] && i18n[key].length > 0) {
        return i18n[key];
    } else {
        lang === default_lang || log('Unknown translation key:', key);
        return key;
    }
}

$.extend({ '_': gettext });