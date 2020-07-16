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
    switch (message.type) {
    case "js":
    case "selector":
        let sendMessage = function(tab) {
            // console.log("send tab id=", tab.id);
            api_send_tab_message(tab.id, message, function(response) {
                response_chan_set(message['UID'], response);
                // console.log(response);
                let callbackMessage = message;
                callbackMessage['response'] = response;
                api_send_callback_message(sender, message, callbackMessage);
            });
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
        // console.log(message)
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

// 监听键盘事件
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

// 初始化cron
var cronJobStacks = {};
var cronJobMaps = {};
api_storage_sync_get("cron-jobs", function(results) {
    if (results.hasOwnProperty("cron-jobs")) {
        cronJobMaps = results["cron-jobs"];
        for (let id in cronJobMaps) {
            if (cronJobMaps[id].enabled) {
                cronItemRunStart(cronJobMaps[id]);
            }
        }
    }
});
function addCronItem(taburl, options) {
    // 对url去除锚点
    let archPos = taburl.indexOf('#');
    if (taburl.indexOf('#') > 0) {
        taburl = taburl.substring(0, archPos)
    }
    let item = {
        id: getUID(),
        rule: options.rule,
        cmds: options.cmds,
        url: taburl,
        openType: options.hasOwnProperty('openType') ? options.openType : "auto-open",  // auto-open, open-only 
        showType: options.hasOwnProperty('showType') ? options.showType : "frontend", // background, frontend
        enabled: true,  // true, false
        times: 0
    }
    cronJobMaps[item.id] = item;
    cronItemRunStart(item);
    api_storage_sync_set({"cron-jobs": cronJobMaps});
}
function updateCronItem(options) {
    if (options.hasOwnProperty('id') && cronJobMaps.hasOwnProperty(options.id)) {
        let id = options.id;
        if (options.hasOwnProperty('rule')) {
            cronJobMaps[id]['rule'] = options.rule;
            cronItemRunStop(cronJobMaps[id]);
            if (!options.hasOwnProperty('enabled'))
                options['enabled'] = cronJobMaps[id]['enabled'];
        }
        if (options.hasOwnProperty('cmds')) cronJobMaps[id]['cmds'] = options.cmds;
        if (options.hasOwnProperty('showType')) cronJobMaps[id]['showType'] = options.showType;
        if (options.hasOwnProperty('openType')) cronJobMaps[id]['openType'] = options.openType;
        if (options.hasOwnProperty('enabled')) {
            cronJobMaps[id]['enabled'] = options.enabled;
            if (options.enabled) {
                cronItemRunStart(cronJobMaps[id]);
            } else {
                cronItemRunStop(cronJobMaps[id]);
            }
        }
        api_storage_sync_set({"cron-jobs": cronJobMaps});
    }
}
function removeCronItem(options) {
    if (options.hasOwnProperty('id')) {
        cronItemRunStop(cronJobMaps[options.id]);
        delete cronJobMaps[options.id];
        api_storage_sync_set({"cron-jobs": cronJobMaps});
    }
}
function cronItemRunStart(item) {
    if (!item.enabled || cronJobStacks.hasOwnProperty(item.id)) return false;
    cronJobStacks[item.id] = {};
    try {
        let openTabToConnect = function(tab) {
            if (!tab) {
                if (item.openType == "auto-open") {
                    api_tab_create(item.url, function(tab) {
                        cronJobStacks[item.id]['tab'] = tab;
                        waitTabComplete(tab, 300, function(tab) {
                            item.times++;
                            api_send_tab_message(tab.id, {type: "cron-job", item: item})
                        });
                    });
                }
            } else {
                // console.log("api_send_tab_message", tab, {type: "cron-job", item: item});
                item.times++;
                api_send_tab_message(tab.id, {type: "cron-job", item: item})
            }
        }

        cronJobStacks[item.id]['job'] = new CronJob(item.rule, function() {
            if (cronJobStacks[item.id].hasOwnProperty('tab')) {
                api_tab_get(cronJobStacks[item.id].tab.id, function(tab) {
                    openTabToConnect(tab);
                });
            } else {
                api_tab_query({url: item.url}, function(tabs) {
                    openTabToConnect(tabs && tabs.length > 0 ? tabs[0] : null);
                });
            }
        });
    } catch (error) {
        console.log(error)
    }
}

function cronItemRunStop(item) {
    if (cronJobStacks.hasOwnProperty(item.id) && cronJobStacks[item.id].hasOwnProperty('job')) {
        cronJobStacks[item.id]['job'].Stop();
        item.enabled = false;
        delete cronJobStacks[item.id];
    }
}

function waitTabComplete(tab, timeout, callback) {
    if (tab.status == 'loading') {
        setTimeout(() => {
            chrome.tabs.get(tab.id, (tab) => {
                waitTabComplete(tab, timeout+500, callback)
            });
        }, timeout);
    } else if (tab.status == 'complete') {
        callback(tab)
    }
}