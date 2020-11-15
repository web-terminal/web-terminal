function api_getURL(url) {
    return chrome.runtime.getURL(url)
}

function api_getIcon(url, size) {
    if (!size) size = 16;
    return "chrome://favicon/size/" + size + "@1x/" + url;
}

function api_locale_language() {
    return chrome.i18n.getUILanguage();
}


function api_tab_onupdated(callback) {
    chrome.tabs.onUpdated.addListener(callback);
}

function api_tab_create(url, callback) {
    let config = typeof url == 'object' ? url : { url: url };
    chrome.tabs.create(config, callback);
}

function api_tab_get(tabId, callback) {
    chrome.tabs.get(tabId, callback);
}

function api_tab_update(tabId, data, callback) {
    chrome.tabs.update(tabId, data, callback)
}

function api_tab_current(callback) {
    api_tab_query({ active: true, currentWindow: true }, callback);
}

function api_tab_query(query, callback) {
    chrome.tabs.query(query, callback);
}

function api_tab_remove(tabIds, callback) {
    chrome.tabs.remove(tabIds, callback)
}
