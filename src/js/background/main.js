var tabChan = {};
var responseChan = {};
function response_chan_set(messageId, response) {
    if (!responseChan.hasOwnProperty(messageId)) responseChan[messageId] = [];
    responseChan[messageId].push() ;
    let messageIds = Object.keys(responseChan);
    if (messageIds.length > 50) delete responseChan[messageIds[0]];
}
function response_chan_get() {

}

// 监听注入页面事件
api_runtime_on_message_listener(function(message, sender, callback) {
    // console.log(sender)
    switch (message.type) {
    case "js":
    case "selector":
        let sendMessage = function(tab) {
            // console.log("send tab id=", tab.id);
            if (message.type == 'js') {
                if (tab.url.startsWith('chrome-extension://'+sender.id)) {
                    let callbackMessage = message;
                    callbackMessage['response'] = "you can only exec js command at the normal url page, can not exec js at the extension pages.";
                    api_send_callback_message(sender, message, callbackMessage);
                    return false;
                }
                let content = message.content.join('')
                api_execute_script(tab.id, {code: content}, function(result) {
                    for (let i in result) {
                        let callbackMessage = message;
                        callbackMessage['response'] = JSON.stringify(result[i]);
                        api_send_callback_message(sender, message, callbackMessage);
                    }
                });
            } else {
                api_send_tab_message(tab.id, message, function(response) {
                    response_chan_set(message['UID'], response);
                    // console.log(response);
                    let callbackMessage = message;
                    callbackMessage['response'] = response;
                    api_send_callback_message(sender, message, callbackMessage);
                });
            }
        }
        // console.log(message.options)
        if (message.options.hasOwnProperty('url')) {
            if (!tabChan.hasOwnProperty(message.options.url)) {
                api_tab_create(message.options.url, function(tab) {
                    tabChan[message.options.url] = tab;
                    waitTabComplete(tab, 300, sendMessage);
                });
            } else {
                api_tab_get(tabChan[message.options.url].id, function(tab) {
                    if (!tab) {
                        api_tab_create(message.options.url, function(tab) {
                            tabChan[message.options.url] = tab;
                            waitTabComplete(tab, 300, sendMessage);
                        });
                    } else {
                        // active tab
                        api_tab_update(tab.id, {active: true})
                        sendMessage(tab);
                    }
                });
            }
        } else {
            sendMessage(sender.tab);
        }
    break;
    case "webRequest":
        if (message.hasOwnProperty('config')) {
            message.config['complete'] = function(xhr, ts) {
                api_send_callback_message(sender, message, {
                    data: {
                        xhr: xhr,
                        ts: ts
                    }
                });
            }
            $.ajax(message.config);
        }
    break;
    case "browser-notifications":
        api_notifications_create(message.options, function(result) {
            api_send_callback_message(sender, message, {
                data: result
            });
        });
    break;
    case "browser-bookmarks":
        if (message.options.type == 'query') {
            api_bookmark_query(message.options.query, function(results) {
                api_send_callback_message(sender, message, {
                    data: results
                });
            });
        } else if (message.options.type == 'getRecent') {
            api_bookmark_getRecent(message.options.numberOfItems, function(results) {
                api_send_callback_message(sender, message, {
                    data: results
                });
            });
        }
    break;
    case "browser-history":
        api_history_query(message.options, function(results) {
            api_send_callback_message(sender, message, {
                data: results
            });
        });
    break;
    case "cron-job":
        let returnMessage = {data: 'ok'};
        if (message.options.type == 'list') {
            returnMessage.data = cronJobMaps;
        } else if (message.options.type == 'add') {
            addCronItem(sender.tab.url, message.options);
        } else if (message.options.type == 'delete') {
            removeCronItem(message.options);
        } else if (message.options.type == 'update') {
            updateCronItem(message.options)
        }
        api_send_callback_message(sender, message, returnMessage);
    break;
    case "exec-remote-command":
        var config = message.config;
        api_tab_query({url: config.hasOwnProperty('match_url') ? config.match_url : config.site}, function(tabs) {
            if (tabs && tabs.length > 0) {
                for (let i in tabs) {
                    api_send_tab_message(tabs[i].id, {type: "remote-command-run", item: message.item}, function(result) {
                        api_send_callback_message(sender, message, result);
                    });
                    if (!config.hasOwnProperty('exec_all_match_url') || !config.exec_all_match_url) break;
                }
            } else {
                if (config.hasOwnProperty('auto_open') && config.auto_open) {
                    api_tab_create({url: config.site, active: config.hasOwnProperty('active_url') ? config.active_url : true}, function(tab) {
                        waitTabComplete(tab, 300, function(tab) {
                            api_send_tab_message(tab.id, {type: "remote-command-run", item: message.item}, function(result) {
                                api_send_callback_message(sender, message, {'data':result});
                            });
                        });
                    });
                }
            }
            
        });
    break;
    case "exec-remote-tab":
        var config = message.config;
        api_tab_query({url: config.hasOwnProperty('match_url') ? config.match_url : config.site}, function(tabs) {
            if (tabs && tabs.length > 0) {
                for (let i in tabs) {
                    api_send_tab_message(tabs[i].id, {type: "remote-tab-run", item: message.item}, function(result) {
                        api_send_callback_message(sender, message, result);
                    });
                    break;
                }
            } else {
                if (config.hasOwnProperty('auto_open') && config.auto_open) {
                    console.log({url: config.site, active: config.hasOwnProperty('active_url') ? config.active_url : true})
                    api_tab_create({url: config.site, active: config.hasOwnProperty('active_url') ? config.active_url : true}, function(tab) {
                        waitTabComplete(tab, 300, function(tab) {
                            api_send_tab_message(tab.id, {type: "remote-tab-run", item: message.item}, function(result) {
                                api_send_callback_message(sender, message, {'data':result});
                            });
                        });
                    });
                }
            }
            
        });
    break;
    case "cmdhub":
        message_cmdhub(message, sender, callback);
    break;
    }
});

// var storageChangesListenerMessageChannel = {}
// var storageChangesListener = {}
// api_storage_on_change_listener(function(changes, areaName) {
//     for (let key in changes) {
//         if (storageChangesListenerMessageChannel.hasOwnProperty(key)) {
//             storageChangesListenerMessageChannel[key]
//             api_send_tab_message(
//                 storageChangesListenerMessageChannel[key][tab]['id'],
//                 changes[key]['newValue'],
//                 info => {
//                     console.log("selector response:", info)
//                     // callback(info)
//                 }
//             )
//             delete storageChangesListenerMessageChannel[key];
//         } else if (storageChangesListener.hasOwnProperty(key)) {
//             storageChangesListener[key](changes[key]['newValue'], changes[key]['oldValue']);
//         }
//     }
// });

// listener 
api_tab_onupdated(function(tabId, changeInfo, tab) {
    cmdhub_listen_tab_loading_event(tabId, changeInfo, tab);
});

// listener key code event
chrome.commands.onCommand.addListener(function(command) {
    // console.log('Command:', command);
    if (command == "toggle-cmdwin") {
        api_tab_current(function(tabs) {
            try {
                // console.log(tabs);
                api_send_tab_message(
                    tabs[0].id,
                    {type: 'toggleCmdWin'},
                    info => {
                        if (info == undefined) {
                            api_tab_create('/main.html');
                        }
                        // console.log("callback", info)
                    }
                )
            } catch (error) {
                console.log(error)
            }
        });
    }
});

function waitTabComplete(tab, timeout, callback) {
    if (tab.status == 'loading') {
        setTimeout(() => {
            api_tab_get(tab.id, (tab) => {
                waitTabComplete(tab, timeout+500, callback)
            });
        }, timeout);
    } else if (tab.status == 'complete') {
        callback(tab)
    }
}