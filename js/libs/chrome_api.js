function getUID(length) {
    if (!length) length = 5;
    return Number(Math.random().toString().substr(3, length) + Date.now()).toString(36);
}
// 获取本地化语言
function api_locales(message) {
    return chrome.i18n.getMessage(message)
}

function api_locale_language() {
    return chrome.i18n.getUILanguage();
}

function api_getURL(url) {
    return chrome.runtime.getURL(url)
}

function api_runtime_on_message_listener(callback) {
    chrome.runtime.onMessage.addListener(callback);
}

var messageAsyncCallbackRegister = {};
function api_send_message(message, callback) {
    message['UID'] = getUID();
    if (message.hasOwnProperty('callback')) {
        messageAsyncCallbackRegister[message['UID']] = message.callback;
    }
    chrome.runtime.sendMessage(message, callback)
}
function api_send_callback_message(sender, fromMessage, returnMessage) {
    returnMessage['from'] = fromMessage['type'];
    returnMessage['type'] = 'messageCallback';
    returnMessage['UID'] = fromMessage['UID'];
    api_send_tab_message(sender.tab.id, returnMessage)
}
function api_message_callback(message) {
    if (messageAsyncCallbackRegister.hasOwnProperty(message['UID'])) {
        messageAsyncCallbackRegister[message['UID']](message);
        delete messageAsyncCallbackRegister[message['UID']];
    }
}

function api_send_tab_message(tabID, message, callback) {
    chrome.tabs.sendMessage(tabID, message, callback)
}

function api_storage_sync_set(data, callback) {
    chrome.storage.sync.set(data, callback)
}

function api_storage_sync_get(data, callback) {
    chrome.storage.sync.get(data, callback)
}

function api_storage_sync_remove(data, callback) {
    chrome.storage.sync.get(data, callback)
}

function api_storage_local_set(data, callback) {
    chrome.storage.local.set(data, callback)
}

function api_storage_local_get(data, callback) {
    chrome.storage.local.get(data, callback)
}

function api_storage_local_remove(data, callback) {
    chrome.storage.local.get(data, callback)
}

function api_storage_on_change_listener(callback) {
    chrome.storage.onChanged.addListener(callback)
}

function api_tab_create(url, callback) {
    chrome.tabs.create({url: url}, callback);
}

function api_tab_get(tabId, callback) {
    chrome.tabs.get(tabId, callback);
}

function api_tab_current(callback) {
    api_tab_query({active: true, currentWindow: true}, callback);
}

function api_tab_query(query, callback) {
    chrome.tabs.query(query, callback);
}

function api_bookmark_query(query, callback) {
    chrome.bookmarks.search(query, callback);
}

function api_bookmark_getRecent(numberOfItems, callback) {
    chrome.bookmarks.getRecent(numberOfItems, callback);
}

function api_history_query(query, callback) {
    chrome.history.search(query, callback);
}

function api_notifications_create(options, callback) {
    chrome.notifications.create(options, callback);
}