function getUID(length) {
    if (!length) length = 5;
    return Number(Math.random().toString().substr(3, length) + Date.now()).toString(36);
}

// 获取本地化语言
function api_locales(message, placeholders) {
    var res = chrome.i18n.getMessage(message, placeholders);
    return res ? res : message;
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
    if (typeof returnMessage != 'object') api_send_callback_message = {};
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
    chrome.storage.sync.remove(data, callback)
}

function api_storage_local_remove(data, callback) {
    chrome.storage.local.remove(data, callback)
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

function api_execute_script(tabId, details, callback) {
    chrome.tabs.executeScript(tabId, details, callback);
}

function api_manifest(callback) {
    $.get(chrome.extension.getURL('manifest.json'), callback, 'json');
}