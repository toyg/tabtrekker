/* SDK Modules */
const globalPrefs = require('sdk/preferences/service');
const simplePrefs = require('sdk/simple-prefs');
const self = require("sdk/self");
const pageMod = require("sdk/page-mod");

/* Constants */
//preferences
const _24HOUR_PREF = '24hour';
const ENABLED_PREF = 'enabled';
const NEWTAB_PREF = 'browser.newtab.url';
//messages
const TIME_MSG = 'time';
//others
const NEWTAB_FILE = 'newtab.html';

//run on addon load
exports.main = function(options, callbacks) {
    setNewTabUrl();
};

//listen to preference changes
simplePrefs.on(ENABLED_PREF, setNewTabUrl);

/**
 * Sets new tab URL if addon is enabled. 
 * Resets new tab URL if addon is disabled.
 */
function setNewTabUrl() {
    if(simplePrefs.prefs[ENABLED_PREF]) {
        globalPrefs.set(NEWTAB_PREF, self.data.url(NEWTAB_FILE));
    } else {
        globalPrefs.reset(NEWTAB_PREF);
    }
}

//load content scripts
pageMod.PageMod({
    include: self.data.url(NEWTAB_FILE),
    contentScriptFile: [self.data.url('js/jquery-2.1.1.min.js'),
                        self.data.url('js/moment-with-locales.min.js'),
                        self.data.url('js/time.js')],
    onAttach: notifyTimePrefs
});

/**
 * Sends time preference values to the content scripts.
 */
function notifyTimePrefs(worker) {
    var prefs = {};
    prefs[_24HOUR_PREF] = simplePrefs.prefs[_24HOUR_PREF];
    worker.port.emit(TIME_MSG, prefs);
}